---
showOnIndexPage: true
date: 2025-01-15
title: S.O.L.I.D Principles
image: Softwarearchitecture.png
description: Die SOLID-Prinzipien sind fünf grundlegende Prinzipien des objektorientierten Designs, die darauf abzielen, Software verständlicher, flexibler und wartbarer zu machen.
tags:
  - Softwarearchitecture
  - Python
---

## S.O.L.I.D

Die SOLID-Prinzipien sind fünf grundlegende Prinzipien des objektorientierten Designs, die darauf abzielen, Software verständlicher, flexibler und wartbarer zu machen. Diese Prinzipien wurden von Robert C. Martin (auch bekannt als Uncle Bob) eingeführt und sind ein wichtiger Bestandteil der Softwareentwicklung. Hier sind die fünf Prinzipien im Detail:

- **Single Responsibility Principle (SRP)**: Eine Klasse sollte nur eine einzige Verantwortlichkeit haben. Das bedeutet, dass sie nur einen Grund haben sollte, sich zu ändern.
- **Open-Closed Principle (OCP)**: Softwaremodule sollten offen für Erweiterungen, aber geschlossen für Änderungen sein. Das bedeutet, dass man neue Funktionen hinzufügen kann, ohne den bestehenden Code zu ändern.
- **Liskov Substitution Principle (LSP)**: Objekte einer Basisklasse sollten durch Objekte ihrer abgeleiteten Klassen ersetzt werden können, ohne dass das Programmverhalten verändert wird.
- **Interface Segregation Principle (ISP)**: Eine Klasse sollte nicht gezwungen sein, Schnittstellen zu implementieren, die sie nicht benötigt. Es ist besser, viele spezifische Schnittstellen zu haben, als eine allgemeine.
- **Dependency Inversion Principle (DIP)**: Abhängigkeiten sollten von Abstraktionen abhängen, nicht von konkreten Implementierungen. Das bedeutet, dass hochrangige Module nicht von niederrangigen Modulen abhängen sollten, sondern beide von Abstraktionen.

Diese Prinzipien helfen Entwicklern, sauberen, verständlichen und wartbaren Code zu schreiben.

## Single Responsibility Principle

Das Single Responsibility Principle (SRP) besagt, dass eine Klasse nur eine einzige Verantwortlichkeit haben sollte. Das bedeutet, dass eine Klasse nur einen Grund haben sollte, sich zu ändern. Hier ist ein praktisches Beispiel, wie man das SRP anwenden kann:

Stellen wir uns vor, wir haben eine Klasse, die sowohl für das Speichern von Benutzerdaten als auch für das Senden von E-Mails verantwortlich ist:

~~~python
class UserService:
    def save_user(self, user):
        # Code zum Speichern des Benutzers
        pass

    def send_welcome_email(self, user):
        # Code zum Senden einer Willkommens-E-Mail
        pass
~~~

Diese Klasse hat zwei Verantwortlichkeiten: das Speichern von Benutzerdaten und das Senden von E-Mails. Um das SRP zu befolgen, sollten wir diese Verantwortlichkeiten in separate Klassen aufteilen:

~~~python
class UserRepository:
    def save_user(self, user):
        # Code zum Speichern des Benutzers
        pass

class EmailService:
    def send_welcome_email(self, user):
        # Code zum Senden einer Willkommens-E-Mail
        pass
~~~

Jetzt hat jede Klasse nur eine Verantwortlichkeit: UserRepository ist für das Speichern von Benutzerdaten zuständig, und EmailService ist für das Senden von E-Mails verantwortlich.

## Open-Closed Principle

Das Open-Closed Principle (OCP) besagt, dass Softwaremodule offen für Erweiterungen, aber geschlossen für Änderungen sein sollten. Das bedeutet, dass man neue Funktionen hinzufügen kann, ohne den bestehenden Code zu ändern. Hier ist ein praktisches Beispiel, wie man das OCP anwenden kann:

Stellen wir uns vor, wir haben eine Anwendung, die verschiedene Arten von Berichten generiert. Zunächst könnte der Code so aussehen:

~~~python
class ReportGenerator:
    def generate_report(self, report_type):
        if report_type == "PDF":
            return self.generate_pdf_report()
        elif report_type == "Excel":
            return self.generate_excel_report()
    
    def generate_pdf_report(self):
        # PDF-Berichtserstellungscode
        pass
    
    def generate_excel_report(self):
        # Excel-Berichtserstellungscode
        pass
~~~

Dieser Code verstößt gegen das OCP, da jede neue Berichtart eine Änderung der generate_report-Methode erfordert. Um das OCP zu befolgen, können wir eine abstrakte Basisklasse und spezifische Unterklassen für jede Berichtart erstellen:

~~~python
from abc import ABC, abstractmethod

class Report(ABC):
    @abstractmethod
    def generate(self):
        pass

class PDFReport(Report):
    def generate(self):
        # PDF-Berichtserstellungscode
        pass

class ExcelReport(Report):
    def generate(self):
        # Excel-Berichtserstellungscode
        pass

class ReportGenerator:
    def generate_report(self, report: Report):
        return report.generate()
~~~

Jetzt können wir neue Berichtarten hinzufügen, indem wir einfach neue Unterklassen von Report erstellen, ohne den ReportGenerator zu ändern

## Liskov Substitution Principle (LSP)

Das Liskov Substitution Principle (LSP) besagt, dass Objekte einer Basisklasse durch Objekte ihrer abgeleiteten Klassen ersetzt werden können sollten, ohne dass das Programmverhalten verändert wird. Hier ist ein praktisches Beispiel, wie man das LSP anwenden kann:

Stellen wir uns vor, wir haben eine Basisklasse Bird und zwei abgeleitete Klassen Eagle und Penguin. Ohne das LSP könnte der Code so aussehen:

~~~python
class Bird:
    def fly(self):
        pass

class Eagle(Bird):
    def fly(self):
        print("Eagle is flying")

class Penguin(Bird):
    def fly(self):
        raise Exception("Penguins can't fly")
~~~

Hier verstößt die Klasse Penguin gegen das LSP, da sie die fly-Methode der Basisklasse Bird nicht sinnvoll implementiert. Um das LSP zu befolgen, sollten wir die Klassenhierarchie so gestalten, dass alle abgeleiteten Klassen die Methoden der Basisklasse sinnvoll nutzen können. Eine Möglichkeit wäre, die Bird-Klasse in zwei separate Basisklassen zu unterteilen:

~~~python
class Bird(ABC):
    @abstractmethod
    def move(self):
        pass

class FlyingBird(Bird):
    def move(self):
        self.fly()

    @abstractmethod
    def fly(self):
        pass

class Eagle(FlyingBird):
    def fly(self):
        print("Eagle is flying")

class Penguin(Bird):
    def move(self):
        print("Penguin is walking")
~~~

In diesem Beispiel haben wir die Bird-Klasse in Bird und FlyingBird unterteilt. Jetzt können Eagle und Penguin die move-Methode sinnvoll implementieren, ohne das LSP zu verletzen.

## Interface Segregation Principle (ISP)

Das Interface Segregation Principle (ISP) besagt, dass eine Klasse nicht gezwungen sein sollte, Schnittstellen zu implementieren, die sie nicht benötigt. Stattdessen sollten Schnittstellen klein und spezifisch sein. Hier ist ein praktisches Beispiel, wie man das ISP anwenden kann:

Stellen wir uns vor, wir haben eine Schnittstelle Worker, die sowohl Arbeits- als auch Essensmethoden enthält:

~~~python
from abc import ABC, abstractmethod

class Worker(ABC):
    @abstractmethod
    def work(self):
        pass

    @abstractmethod
    def eat(self):
        pass

class Developer(Worker):
    def work(self):
        print("Developer is coding.")

    def eat(self):
        print("Developer is eating.")

class Robot(Worker):
    def work(self):
        print("Robot is working.")

    def eat(self):
        raise NotImplementedError("Robot does not eat.")
~~~

In diesem Beispiel verstößt die Klasse Robot gegen das ISP, da sie die Methode eat implementieren muss, obwohl sie diese nicht benötigt. Um das ISP zu befolgen, können wir die Schnittstelle Worker in spezifischere Schnittstellen aufteilen:

~~~python
from abc import ABC, abstractmethod

class Workable(ABC):
    @abstractmethod
    def work(self):
        pass

class Eatable(ABC):
    @abstractmethod
    def eat(self):
        pass

class Developer(Workable, Eatable):
    def work(self):
        print("Developer is coding.")

    def eat(self):
        print("Developer is eating.")

class Robot(Workable):
    def work(self):
        print("Robot is working.")
}
~~~

Jetzt implementiert Robot nur die Workable-Schnittstelle und muss keine unnötigen Methoden mehr implementieren.

## Dependency Inversion Principle (DIP)

Das Dependency Inversion Principle (DIP) besagt, dass hochrangige Module nicht von niederrangigen Modulen abhängen sollten, sondern beide von Abstraktionen. Dies fördert lose Kopplung und erleichtert die Wartung und Erweiterung des Codes. Hier ist ein praktisches Beispiel, wie man das DIP in Python anwenden kann:

Im negativen Beispiel haben wir eine Klasse LightSwitch, die direkt von der Klasse LightBulb abhängt:

~~~python
class LightBulb:
    def turn_on(self):
        print("LightBulb is on")

    def turn_off(self):
        print("LightBulb is off")

class LightSwitch:
    def __init__(self, bulb: LightBulb):
        self.bulb = bulb

    def operate(self, on: bool):
        if on:
            self.bulb.turn_on()
        else:
            self.bulb.turn_off()
~~~

In diesem Beispiel hängt die Klasse LightSwitch direkt von der konkreten Implementierung LightBulb ab. Dies verstößt gegen das DIP, da Änderungen an LightBulb auch Änderungen an LightSwitch erfordern könnten.

Um das DIP zu befolgen, sollten wir Abstraktionen einführen, sodass LightSwitch nicht direkt von LightBulb abhängt:

~~~python
from abc import ABC, abstractmethod

class Switchable(ABC):
    @abstractmethod
    def turn_on(self):
        pass

    @abstractmethod
    def turn_off(self):
        pass

class LightBulb(Switchable):
    def turn_on(self):
        print("LightBulb is on")

    def turn_off(self):
        print("LightBulb is off")

class Fan(Switchable):
    def turn_on(self):
        print("Fan is on")

    def turn_off(self):
        print("Fan is off")

class LightSwitch:
    def __init__(self, device: Switchable):
        self.device = device

    def operate(self, on: bool):
        if on:
            self.device.turn_on()
        else:
            self.device.turn_off()
~~~

In diesem positiven Beispiel haben wir eine Abstraktion Switchable eingeführt, die von LightBulb und Fan implementiert wird. Die Klasse LightSwitch hängt nun von der Abstraktion Switchable ab, nicht von der konkreten Implementierung. Dadurch können wir leicht neue Geräte hinzufügen, ohne den LightSwitch ändern zu müssen.
