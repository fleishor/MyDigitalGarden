---
showOnIndexPage: true
date: 2026-11-25
title: Optimizer
image: MariaDB.png
description:
tags:
  - MariaDB
---

## Explain vs. Analyze

- Explain liefert den (geschätzen) Execution Plan zurück; Statement wir nicht ausgeführt. 
- Analyze hingegen für das Statement aus und kann somit Ist-Rows zurückliefern (vgl. Oracle Row-Level-ExecutionPlan)

## Test data
### Table

~~~sql
CREATE TABLE Measurements (
   Id bigint(20) unsigned NOT NULL AUTO_INCREMENT,
   DeviceId bigint(20) unsigned NOT NULL,
   MeasurementId bigint(20) unsigned NOT NULL,
   MeasuredAt datetime(6) NOT NULL,
   MeasurementValue decimal(18,6) NOT NULL,

   PRIMARY KEY (Id),
   KEY Measurements_DeviceId_IDX (DeviceId) USING BTREE,
   KEY Measurements_MeasurementId_IDX (MeasurementId) USING BTREE,
   KEY Measurements_MeasureAt_IDX (DeviceId,MeasurementId,MeasuredAt) USING BTREE,
   KEY Measurements_DeviceId_MeasuredAt_IDX (DeviceId,MeasuredAt) USING BTREE
) ENGINE=InnoDB;
~~~

### Add test data

~~~sql
DELIMITER //

DROP PROCEDURE IF EXISTS FillMeasurements//

CREATE PROCEDURE FillMeasurements()
BEGIN
	DECLARE v_day DATE;
	DECLARE v_start DATE;
	DECLARE v_end DATETIME;
	DECLARE v_last_day DATE;
	
	SET v_start = MAKEDATE(YEAR(CURRENT_DATE), 1);
	SET v_end = CAST(
		DATE_FORMAT(CURRENT_TIMESTAMP, '%Y-%m-%d %H:00:00')
		AS DATETIME
	);
	SET v_day = v_start;
	SET v_last_day = DATE(v_end);
	
	-- Hilfszahlen 0 bis 9999 erzeugen
	CREATE TEMPORARY TABLE tmp_numbers (
		n INT NOT NULL PRIMARY KEY
	);
	  
	INSERT INTO tmp_numbers (n)
	SELECT a.d + 10 * b.d + 100 * c.d + 1000 * e.d
	FROM
		(SELECT 0 d UNION ALL SELECT 1 UNION ALL SELECT 2 UNION ALL
		SELECT 3 UNION ALL SELECT 4 UNION ALL SELECT 5 UNION ALL
		SELECT 6 UNION ALL SELECT 7 UNION ALL SELECT 8 UNION ALL SELECT 9) a
	CROSS JOIN
		(SELECT 0 d UNION ALL SELECT 1 UNION ALL SELECT 2 UNION ALL
		SELECT 3 UNION ALL SELECT 4 UNION ALL SELECT 5 UNION ALL
		SELECT 6 UNION ALL SELECT 7 UNION ALL SELECT 8 UNION ALL SELECT 9) b
	CROSS JOIN
		(SELECT 0 d UNION ALL SELECT 1 UNION ALL SELECT 2 UNION ALL
		SELECT 3 UNION ALL SELECT 4 UNION ALL SELECT 5 UNION ALL
		SELECT 6 UNION ALL SELECT 7 UNION ALL SELECT 8 UNION ALL SELECT 9) c
	CROSS JOIN
		(SELECT 0 d UNION ALL SELECT 1 UNION ALL SELECT 2 UNION ALL
		SELECT 3 UNION ALL SELECT 4 UNION ALL SELECT 5 UNION ALL
		SELECT 6 UNION ALL SELECT 7 UNION ALL SELECT 8 UNION ALL SELECT 9) e;
	  
	CREATE TEMPORARY TABLE tmp_devices (
		DeviceId INT NOT NULL PRIMARY KEY
	);
	  
	INSERT INTO tmp_devices (DeviceId)
	SELECT n FROM tmp_numbers WHERE n BETWEEN 1 AND 15;
	  
	CREATE TEMPORARY TABLE tmp_measurements (
		MeasurementId INT NOT NULL PRIMARY KEY
	);
	  
	INSERT INTO tmp_measurements (MeasurementId)
	SELECT n FROM tmp_numbers WHERE n BETWEEN 1 AND 20;
	  
	CREATE TEMPORARY TABLE tmp_hours (
		HourOfDay INT NOT NULL PRIMARY KEY
	);
	  
	INSERT INTO tmp_hours (HourOfDay)
	SELECT n FROM tmp_numbers WHERE n BETWEEN 0 AND 23;
	  
	-- Pro Tag ein Insert; die aktuelle, noch nicht abgeschlossene Stunde entfällt.
	WHILE v_day <= v_last_day DO
		  
		INSERT INTO Measurements
			(DeviceId, MeasurementId, MeasurementValue, MeasuredAt)
		SELECT
			d.DeviceId,
			m.MeasurementId,
			ROUND(
				70 * SIN(
					2 * PI()
					* (DATEDIFF(v_day, v_start) * 24 + h.HourOfDay)
					/ (24 * (3 + MOD(m.MeasurementId, 10)))
					+ d.DeviceId * 0.37
					+ m.MeasurementId * 0.19
				)
				+ 20 * SIN(
					2 * PI()
					* (DATEDIFF(v_day, v_start) * 24 + h.HourOfDay)
					/ (24 * (20 + MOD(d.DeviceId, 15)))
					+ m.MeasurementId * 0.41
				),
				6
			),
			TIMESTAMP(v_day) + INTERVAL h.HourOfDay HOUR
		FROM tmp_devices AS d
		CROSS JOIN tmp_measurements AS m
		CROSS JOIN tmp_hours AS h
		WHERE TIMESTAMP(v_day) + INTERVAL h.HourOfDay HOUR < v_end;
		  
		SET v_day = DATE_ADD(v_day, INTERVAL 1 DAY);
	END WHILE;
	  
	DROP TEMPORARY TABLE tmp_hours;
	DROP TEMPORARY TABLE tmp_measurements;
	DROP TEMPORARY TABLE tmp_devices;
	DROP TEMPORARY TABLE tmp_numbers;
END//
  
DELIMITER ;
  
CALL FillMeasurements();
  
DROP PROCEDURE FillMeasurements;
~~~

## Optimizer Einstellung

~~~sql
select v.variable_name, v.session_value, v.global_value
from information_schema.system_variables v
where v.variable_name like 'use_stat_tables'
order by v.variable_name
;
~~~

|variable_name|session_value|global_value|
|-------------|-------------|------------|
|USE_STAT_TABLES|COMPLEMENTARY|COMPLEMENTARY|

|Wert|   |
|---|---|
|`never`|Engine-independent-Statistiken werden vom Optimizer nicht verwendet|
|`complementary`|Engine-independent-Statistiken werden verwendet, wenn die Storage Engine keine entsprechende Statistik liefert.|
|`preferably`|Engine-independent-Statistiken werden bevorzugt; fehlt eine Statistik dort, nutzt MariaDB die der Storage Engine.|
|`complementary_for_queries`|Wie `complementary`, aber nur für die Optimierung von Abfragen.|
|`preferably_for_queries`|Wie `preferably`, aber nur für Abfragen. Das ist der Standardwert.|

## Statistiken neu erstellen

~~~sql
ANALYZE TABLE Measurements;
~~~

- MariaDB lässt dabei die Storage Engine – hier InnoDB – ihre eigenen Statistiken aktualisieren. 
- Verwende **nicht** `PERSISTENT FOR ALL`, wenn du ausschließlich Engine-dependent-Statistiken aktualisieren möchtest: Die Option sammelt Engine-independent-Statistiken.
- Abhängig vom Parameter use_stat_tables werden auch die Engine-independent-Statistiken aktualisiert.
- Engine-independent-Statistiken werde **nicht** automatisch aktualisiert (InnoDB-Statistiken schon)
- Wenn du sicherstellen möchtest, dass Engine-independent-Statistiken nicht verwendet werden, kannst du sie für die aktuelle Verbindung deaktivieren und dann analysieren:

~~~sql
SET SESSION use_stat_tables = 'never';
ANALYZE TABLE Measurements;
~~~

## InnoDB Einstellungen

~~~sql
select v.variable_name, v.session_value, v.global_value
from information_schema.system_variables v
where v.variable_name like 'innodb_stats%'
order by v.variable_name
;
~~~


|variable_name|session_value|global_value|
|-------------|-------------|------------|
|INNODB_STATS_AUTO_RECALC||ON|
|INNODB_STATS_INCLUDE_DELETE_MARKED||ON|
|INNODB_STATS_METHOD||nulls_equal|
|INNODB_STATS_MODIFIED_COUNTER||0|
|INNODB_STATS_ON_METADATA||OFF|
|INNODB_STATS_PERSISTENT||ON|
|INNODB_STATS_PERSISTENT_SAMPLE_PAGES||20|
|INNODB_STATS_TRADITIONAL||ON|
|INNODB_STATS_TRANSIENT_SAMPLE_PAGES||8|

## InnoDB Statistiken abfragen und löschen

~~~sql
SELECT *  
FROM   mysql.innodb_table_stats  
WHERE  database_name = DATABASE()  
AND    table_name = 'Measurements' ;

SELECT   *  
FROM     mysql.innodb_index_stats  
WHERE    database_name = DATABASE()  
AND      table_name = 'Measurements'  
ORDER BY 1, 2, 3 ;
         
DELETE  
FROM   mysql.innodb_table_stats  
WHERE  database_name = DATABASE()  
AND    table_name = 'Measurements';

DELETE  
FROM   mysql.innodb_index_stats  
WHERE  database_name = DATABASE()  
AND    table_name = 'Measurements';

FLUSH tables;
~~~

## MariaDB Statistiken abfragen und löschen

~~~sql
SELECT *
FROM   mysql.table_stats
WHERE  db_name = DATABASE()
AND    table_name = 'Measurements'
;

SELECT *
FROM   mysql.column_stats
WHERE  db_name = DATABASE()
AND    table_name = 'Measurements'
;

SELECT *
FROM   mysql.index_stats
WHERE  db_name = DATABASE()
AND    table_name = 'Measurements'
;  

DELETE 
FROM   mysql.table_stats
WHERE  db_name = DATABASE()
AND    table_name = 'Measurements';
  
DELETE 
FROM  mysql.column_stats
WHERE db_name = DATABASE()
AND   table_name = 'Measurements';
   
DELETE 
FROM  mysql.index_stats
WHERE db_name = DATABASE()
AND   table_name = 'Measurements';

FLUSH TABLES;
~~~

## Explain mit Ausgabeformat JSON

~~~sql 
EXPLAIN format=json
select *
from Measurements
where DeviceId = 1
and MeasuredAt between '2026-12-01 00:00:00' and '2026-12-31 00:00:00'
;
~~~

~~~json
{
	"query_block": {
		"select_id": 1,
		"nested_loop": [
			{
			"table": {
				"table_name": "Measurements",
				"access_type": "range",
				"possible_keys": [
					"Measurements_DeviceId_IDX",
					"Measurements_MeasureAt_IDX",
					"Measurements_DeviceId_MeasuredAt_IDX"
				],
				"key": "Measurements_DeviceId_MeasuredAt_IDX",
				"key_length": "16",
				"used_key_parts": ["DeviceId", "MeasuredAt"],
				"rows": 1,
				"filtered": 100,
				"index_condition": "Measurements.DeviceId = 1 and Measurements.MeasuredAt between '2026-12-01 00:00:00.000000' and '2026-12-31 00:00:00.000000'"
				}
			}
		]
	}
}
~~~

## Row-level-execution-plan mit Ausgabeformat JSON

~~~sql
ANALYZE format=json
select *
from Measurements
where DeviceId = 1
and MeasuredAt between '2026-12-01 00:00:00' and '2026-12-31 00:00:00'
;
~~~

~~~json
{
  "query_optimization": {
    "r_total_time_ms": 0.184316614
  },
  "query_block": {
    "select_id": 1,
    "r_loops": 1,
    "r_total_time_ms": 0.251720416,
    "nested_loop": [
      {
        "table": {
          "table_name": "Measurements",
          "access_type": "range",
          "possible_keys": [
            "Measurements_DeviceId_IDX",
            "Measurements_MeasureAt_IDX",
            "Measurements_DeviceId_MeasuredAt_IDX"
          ],
          "key": "Measurements_DeviceId_MeasuredAt_IDX",
          "key_length": "16",
          "used_key_parts": ["DeviceId", "MeasuredAt"],
          "r_loops": 1,
          "rows": 1,
          "r_rows": 0,
          "r_table_time_ms": 0.238340729,
          "r_other_time_ms": 0.006531778,
          "r_engine_stats": {
            "pages_accessed": 3
          },
          "filtered": 100,
          "r_filtered": 100,
          "index_condition": "Measurements.DeviceId = 1 and Measurements.MeasuredAt between '2026-12-01 00:00:00.000000' and '2026-12-31 00:00:00.000000'"
        }
      }
    ]
  }
}
~~~
