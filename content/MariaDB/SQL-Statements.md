---
showOnIndexPage: false
draft: true
date: 2025-12-15
title: SQL-Statements
image: SQL.png
description: Liste mit interessanten SQL statements
tags: 
---

## SUM() OVER()

~~~sql
select ppp.RunId, 
       ppp.PeriodStartCounter, 
       ppp.PeriodEndCounter, 
       ppp.GoodQuantity, 
       ppp.WasteQuantity,
       SUM(ppp.GoodQuantity) 
          OVER (ORDER BY ppp.PeriodStartTime
          ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW) AS GoodQuantitySum,
       SUM(ppp.GoodQuantity+ppp.WasteQuantity) 
          OVER (ORDER BY ppp.PeriodStartTime
          ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW) AS GrossQuantitySum
from PT_ProductionPeriod ppp
where ppp.RunId = 1002
order by ppp.PeriodStartTime;
~~~

### Erklärung
- `SUM(ppp.GoodQuantity) OVER (...)`: berechnet eine laufende Summe
- `ORDER BY ppp.PeriodStartTime`:  bestimmt die Reihenfolge der Aufsummierung
- `UNBOUNDED PRECEDING` bis `CURRENT ROW`:  summiert von der ersten Zeile bis zur aktuellen
- `PARTITION BY ppp.WorkCenterId`: Summierung startet bei WorkCenterId-Wechsel neu 

## WITH RECURSIVE ... AS

~~~sql
WITH RECURSIVE ProductionOrderNetwork AS (
      select opor.id,
             opor.PredecessorOrderId,
             opor.SuccessorOrderId
      from OR_ProductionOrderRelation opor
      join OR_ProductionOrder opo_pre on opo_pre.Id = opor.PredecessorOrderId
      where opo_pre.ExternalProductionOrderId in ('Multi-100111111-10')
   UNION
      select opor.id,
             opor.PredecessorOrderId,
             opor.SuccessorOrderId
      from OR_ProductionOrderRelation opor
      join ProductionOrderNetwork pon on pon.SuccessorOrderId = opor.PredecessorOrderId
   )
SELECT
   concat(opo_pre.Id,
          "[", opo_pre.ExternalProductionOrderId, "]",
          " -->",
          opo_suc.Id,
          "[", opo_suc.ExternalProductionOrderId, "]")
FROM ProductionOrderNetwork pon
join OR_ProductionOrder opo_pre on opo_pre.Id = pon.PredecessorOrderId
join OR_ProductionOrder opo_suc on opo_suc.Id = pon.SuccessorOrderId
;
~~~

### Ergebnis
~~~
73545[Multi-100111111-10] -->73544[Multi-100111111-20]
73544[Multi-100111111-20] -->73543[Multi-100111111-30]
73544[Multi-100111111-20] -->73548[Multi-100111111-15]
73543[Multi-100111111-30] -->73534[100111111a-40]
73543[Multi-100111111-30] -->73539[100111111b-40]
73543[Multi-100111111-30] -->73549[100111111a-35]
73548[Multi-100111111-15] -->73543[Multi-100111111-30]
73534[100111111a-40] -->73533[100111111a-50]
73539[100111111b-40] -->73538[100111111b-50]
73549[100111111a-35] -->73534[100111111a-40]
~~~

### mermaid Diagramm
~~~mermaid
flowchart TD
73545[Multi-100111111-10] -->73544[Multi-100111111-20]
73544[Multi-100111111-20] -->73543[Multi-100111111-30]
73544[Multi-100111111-20] -->73548[Multi-100111111-15]
73543[Multi-100111111-30] -->73534[100111111a-40]
73543[Multi-100111111-30] -->73539[100111111b-40]
73543[Multi-100111111-30] -->73549[100111111a-35]
73548[Multi-100111111-15] -->73543[Multi-100111111-30]
73534[100111111a-40] -->73533[100111111a-50]
73539[100111111b-40] -->73538[100111111b-50]
73549[100111111a-35] -->73534[100111111a-40]
~~~

### Was ist ein CTE?

- **CTE = Common Table Expression**
- **temporäre Ergebnismenge**, die nur für **eine'' SQL-Anweisung existiert
- In Oracle könnte man das am besten mit `FROM (SELECT ...)` vergleichen
- Syntax (nicht rekursiv): `WITH cte_name AS (SELECT ... ) SELECT * FROM cte_name;`

### Was bedeutet hier „rekursiv“?

**Rekursiv** heißt: 
- eine Abfrage **verwendet ihr eigenes Ergebnis aus der vorherigen Iteration erneut**
- in MariaDB: `WITH RECURSIVE cte_name AS ( ... )`

### Grundidee einer rekursiven CTE

Eine rekursive CTE besteht **immer aus zwei Teilen**:

[1] Anker (START WITH) 
UNION ALL 
[2] Rekursiver Teil (CONNECT BY)

Der Anker startet die Hierarchie, der rekursive Teil durchläuft die Hierarchie.

Im obigen Beispiel liefert:
~~~sql
select opor.id,
       opor.PredecessorOrderId,
       opor.SuccessorOrderId
from OR_ProductionOrderRelation opor
join OR_ProductionOrder opo_pre on opo_pre.Id = opor.PredecessorOrderId
where opo_pre.ExternalProductionOrderId in ('Multi-100111111-10')
~~~
den Anker / Einsprungpunkt, sprich den ersten ProductionOrder im Netzwerk

und 

~~~sql
select opor.id,
       opor.PredecessorOrderId,
	   opor.SuccessorOrderId
from OR_ProductionOrderRelation opor
join ProductionOrderNetwork pon on pon.SuccessorOrderId = opor.PredecessorOrderId
~~~

die nachfolgenden ProductionOrder. Die gefunden Datensätze werden mit UNION (keine Duplikate) oder mit UNION ALL (mit Duplikate) hinzugefügt. Der zweite Teil wird für jeden neue hinzugefügten Datensatz nochmals aufgerufen.
