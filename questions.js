// ══════════════════════════════════════════════════════════════════════════
// QUIZ QUESTIONS - Kategorisiert
// ══════════════════════════════════════════════════════════════════════════

const quizQuestions = {
  // ── IT ALLGEMEIN ──────────────────────────────────────────────────────
  it: [
    { q: "Was passiert wenn du 'rm -rf /' als root ausführst?", answers: ["Nichts, Linux ist schlau genug", "Dein Chef kriegt ne Mail", "Dein System wird zum teuren Briefbeschwerer", "Es öffnet sich ein Spiel"], correct: 2, roast: "Wer das nicht weiß, sollte die Finger von der Konsole lassen. 💀" },
    { q: "Was ist ein Segfault?", answers: ["Ein Fehler beim Segeln", "Speicherzugriffsverletzung", "Ein CSS-Property", "Segs fault... baby don't hurt me"], correct: 1, roast: "Segfault: Wenn dein Programm versucht, Erinnerungen zu lesen, die nicht seine sind. Wie dein Ex." },
    { q: "Was macht 'sudo' vor einem Befehl?", answers: ["Macht den PC schneller", "Führt als Superuser aus", "Aktiviert den Dark Mode", "Ruft den Admin an"], correct: 1, roast: "sudo make me a sandwich. Wenn du das nicht kennst, bist du der Sandwich." },
    { q: "Was ist ein 'Stack Overflow'?", answers: ["Wenn der Stack voll ist", "Eine Dating-App für Nerds", "Wenn zu viele Bücher gestapelt werden", "Ein Minecraft-Bug"], correct: 0, roast: "Der einzige Overflow den du kennst ist wenn dein Postfach voll ist." },
    { q: "Was bedeutet HTTP 418?", answers: ["Server nicht gefunden", "I'm a teapot", "Zu viele Anfragen", "Payment Required"], correct: 1, roast: "RFC 2324 – der einzige RFC den man wirklich gelesen haben muss. 🍵" },
    { q: "Wofür steht SQL?", answers: ["Super Quick Language", "Structured Query Language", "Simple Question Logic", "Server Queue List"], correct: 1, roast: "Wer SQL nicht kennt, hat vermutlich noch nie eine Datenbank von innen gesehen." },
    { q: "Was ist ein Fork in Git?", answers: ["Besteck für Entwickler", "Eine Kopie eines Repos", "Ein Merge-Konflikt", "Das Gegenteil von Spoon"], correct: 1, roast: "Fork you, wenn du das nicht weißt." },
    { q: "Was ist 'localhost'?", answers: ["Dein bester Freund", "127.0.0.1 / eigener Rechner", "Ein Minecraft-Server", "Der Host einer Localhost-Party"], correct: 1, roast: "There's no place like 127.0.0.1 🏠" },
    { q: "Was passiert bei einer SQL-Injection?", answers: ["Man injiziert SQL in die Datenbank-Venen", "Böser Input wird als SQL ausgeführt", "Die Datenbank bekommt eine Impfung", "SQL wird schneller"], correct: 1, roast: "Bobby Tables grüßt. Wer seine Inputs nicht sanitized, hat die Kontrolle über sein Leben verloren." },
    { q: "Was ist der Unterschied zwischen == und === in JavaScript?", answers: ["Keiner, ist das gleiche", "=== prüft auch den Typ", "=== ist für Strings", "== ist deprecated"], correct: 1, roast: "JavaScript ist wie Tinder – man weiß nie was man kriegt." },
    { q: "Was macht ein DNS-Server?", answers: ["Löst Domainnamen in IPs auf", "Schützt vor Viren", "Beschleunigt Downloads", "Macht den Bildschirm heller"], correct: 0, roast: "DNS: Das Telefonbuch des Internets. Wer das nicht weiß, googelt wahrscheinlich 'Google'." },
    { q: "Was ist ein Deadlock?", answers: ["Wenn dein PC stirbt", "Zwei Prozesse warten gegenseitig aufeinander", "Ein Sicherheitsfeature", "Wenn das Schloss klemmt"], correct: 1, roast: "Wie zwei Deutsche an einer Tür die beide sagen 'Nach Ihnen'." },
    { q: "Was ist 'Big O Notation'?", answers: ["Ein großes O", "Beschreibt Algorithmus-Komplexität", "Die Note für eine große Prüfung", "Ein Emoji"], correct: 1, roast: "Deine Coding-Skills sind O(n!) – exponentiell schlecht. 📉" },
    { q: "Was ist ein 'Race Condition'?", answers: ["Formel 1 Simulation", "Wenn Threads sich gegenseitig überholen", "Fehler beim Pferderennen", "PC zu schnell"], correct: 1, roast: "Race Condition: Wenn dein Code schneller Fehler macht als du sie fixen kannst." },
    { q: "Was ist ein 'Null Pointer'?", answers: ["Ein Zeiger der auf nichts zeigt", "Ein Hund namens Pointer", "Ein leerer USB-Stick", "Das Gegenteil von Full Pointer"], correct: 0, roast: "Tony Hoare nannte es seinen 'Billion Dollar Mistake'. Du nennst es Dienstag." },
    { q: "Was ist 'Docker'?", answers: ["Ein Spiel mit Enten", "Container-Virtualisierung", "Ein Texteditor", "Das Ding mit dem Wal"], correct: 1, roast: "Docker: Damit 'bei mir läuft's' endlich aufhört eine Ausrede zu sein. 🐳" },
    { q: "Was passiert bei 'git push --force' auf main?", answers: ["Nichts schlimmes", "Überschreibt die Remote-History", "Macht den Push schneller", "Erstellt ein Backup"], correct: 1, roast: "Du hast gerade die Arbeit deiner Kollegen vernichtet. HR meldet sich. 💀" },
    { q: "Was ist 'Recursion'?", answers: ["Siehe: Recursion", "Eine Schleife", "Ein CSS-Property", "Ein Datentyp"], correct: 0, roast: "Um Recursion zu verstehen, muss man zuerst Recursion verstehen. 🔄" },
    { q: "Was ist ein 'Buffer Overflow'?", answers: ["Buffer trinkt zu viel Kaffee", "Schreiben über Puffergrenzen hinaus", "YouTube-Ladebalken", "RAM ist voll"], correct: 1, roast: "Wie zu viel in einen Koffer packen, nur dass danach jemand root hat." },
    { q: "Was ist 'Kubernetes'?", answers: ["Ein griechisches Restaurant", "Container-Orchestrierung", "Ein neues OS", "Frühstücksflocken"], correct: 1, roast: "K8s: Weil Docker allein nicht kompliziert genug war. YAML goes brrr." },
    { q: "Was ist ein 'Merge Conflict'?", answers: ["Wenn zwei Änderungen kollidieren", "Wenn Git abstürzt", "Autounfall", "Merge zu groß"], correct: 0, roast: "Merge Conflicts: Der Grund warum Entwickler Einzelgänger werden. 🥲" },
    { q: "Was ist 'Rubber Duck Debugging'?", answers: ["Debugging mit einer Gummiente", "Bug in Rubber-Duck Software", "Debugging im Bad", "Code für Enten"], correct: 0, roast: "Wenn die Ente dein Problem besser versteht als dein Tech-Lead... 🦆" },
    { q: "Was bedeutet 'RTFM'?", answers: ["Run The File Manager", "Read The F***ing Manual", "Real Time File Monitor", "Return To Factory Mode"], correct: 1, roast: "Die Antwort auf 90% aller Stack Overflow Fragen." },
    { q: "Was ist 'Agile'?", answers: ["Schnell rennen können", "Iterative Softwareentwicklung", "Eine Programmiersprache", "Chef sagt 'schneller'"], correct: 1, roast: "Agile: Die Kunst, alle 2 Wochen zu erklären warum nichts fertig ist. 📋" },
    { q: "Was ist 'Regex'?", answers: ["Ein Dinosaurier", "Reguläre Ausdrücke für Textmuster", "Ein Linux-Distro", "Royal Expression"], correct: 1, roast: "Du hattest ein Problem und hast Regex benutzt. Jetzt hast du zwei Probleme." },
    { q: "Was ist ein 'Memory Leak'?", answers: ["RAM läuft aus", "Speicher allokiert aber nie freigegeben", "Kaputter RAM", "Geheimnisse leaken"], correct: 1, roast: "Dein Chrome-Browser hat angerufen. Er möchte seine 16GB RAM zurück. 🧠" },
    { q: "Wie beendet man Vim?", answers: [":wq", "Alt+F4", "Strg+C", "PC ausmachen und hoffen"], correct: 0, roast: "Millionen von Entwicklern sind immer noch in Vim gefangen. 🙏" },
    { q: "Was ist 'CORS'?", answers: ["Cross-Origin Resource Sharing", "Computer Online Resource System", "Ein Fitness-Kurs", "Corrected Operating Standard"], correct: 0, roast: "CORS-Errors: Der Endboss jeder Frontend-Entwicklung." },
    { q: "Was ist der Unterschied zwischen Git und GitHub?", answers: ["Kein Unterschied", "Git = VCS, GitHub = Hosting", "GitHub ist Premium", "Git ist älter"], correct: 1, roast: "Das eine ist das Konzept, das andere die Plattform." },
    { q: "Was ist 'Blockchain'?", answers: ["Verteiltes, unveränderliches Ledger", "Kette aus Blöcken (Lego)", "Verschlüsselte Technologie", "Lösung für ALLE Probleme"], correct: 0, roast: "Blockchain: Die Antwort auf eine Frage die niemand gestellt hat. 🚀" },

    // Netzwerktechnik
    { q: "Welche Subnetzmaske hat ein /24 Netz?", answers: ["255.255.0.0", "255.255.255.0", "255.255.255.128", "255.0.0.0"], correct: 1, roast: "Das ist FISI Grundwissen. Dein Ausbilder weint gerade." },
    { q: "Welcher Port wird für HTTPS verwendet?", answers: ["80", "443", "8080", "22"], correct: 1, roast: "Port 443. Wenn du das nicht weißt, solltest du dein IHK-Zeugnis zurückgeben." },
    { q: "Was macht ein DHCP-Server?", answers: ["Verschlüsselt Daten", "Verteilt IP-Adressen automatisch", "Blockiert Spam", "Speichert Passwörter"], correct: 1, roast: "DHCP: Damit nicht jeder seine IP per Hand konfigurieren muss. Außer du." },
    { q: "Welche Schicht im OSI-Modell ist die Transportschicht?", answers: ["Schicht 3", "Schicht 4", "Schicht 5", "Schicht 2"], correct: 1, roast: "Schicht 4 - Transport. Merksatz: 'Please Do Not Throw Sausage Pizza Away'." },
    { q: "Was ist der Unterschied zwischen TCP und UDP?", answers: ["TCP ist schneller", "TCP ist verbindungsorientiert, UDP nicht", "UDP ist sicherer", "Kein Unterschied"], correct: 1, roast: "Ich könnte dir nen UDP-Witz erzählen, aber es ist mir egal ob du ihn bekommst." },
    { q: "Wie viele Hosts gibt es in einem /28 Netz?", answers: ["14", "16", "30", "8"], correct: 0, roast: "2^4 - 2 = 14 nutzbare Hosts. Mathe, Baby. 🧮" },
    { q: "Was ist ein VLAN?", answers: ["Virtual Local Area Network", "Very Large Area Network", "Visual LAN Adapter", "Vertical Link Access Node"], correct: 0, roast: "VLANs: Netzwerksegmentierung für Leute die zu geizig für extra Switches sind." },
    { q: "Welches Protokoll löst MAC-Adressen in IP-Adressen auf?", answers: ["ARP", "DNS", "DHCP", "RARP"], correct: 3, roast: "RARP! ARP macht's andersrum (IP → MAC). Klassische IHK-Falle." },
    { q: "Welches Protokoll nutzt Port 53?", answers: ["HTTP", "FTP", "DNS", "SMTP"], correct: 2, roast: "Port 53 = DNS. Das sollte in deinem Hirn hardcoded sein." },
    { q: "Was ist eine DMZ im Netzwerk?", answers: ["Deutsche Militärzone", "Demilitarisierte Zone - Puffer zwischen internem und externem Netz", "Digital Media Zone", "Distributed Management Zone"], correct: 1, roast: "Die DMZ: Wo dein Webserver lebt und hofft, nicht gehackt zu werden." },
    { q: "Was macht NAT?", answers: ["Übersetzt private in öffentliche IP-Adressen", "Verschlüsselt den Traffic", "Beschleunigt das Internet", "Blockiert Angriffe"], correct: 0, roast: "NAT: Der Grund warum dein Heimnetzwerk trotzdem funktioniert." },
    { q: "Welches RAID-Level bietet Spiegelung?", answers: ["RAID 0", "RAID 1", "RAID 5", "RAID 10"], correct: 1, roast: "RAID 1 = Mirror. RAID 0 = Yolo. Große IHK-Klassiker." },
    { q: "Was ist der Unterschied zwischen einem Hub und einem Switch?", answers: ["Kein Unterschied", "Hub sendet an alle, Switch nur an Zielport", "Switch ist langsamer", "Hub ist intelligenter"], correct: 1, roast: "Hubs sind wie Groupchats - jeder bekommt alles. Switches sind gezielter." },
    { q: "Wie groß ist eine MAC-Adresse?", answers: ["32 Bit", "48 Bit", "64 Bit", "128 Bit"], correct: 1, roast: "48 Bit = 6 Bytes. Die IHK liebt diese Frage. LIEBT sie." },
    { q: "Was ist STP (Spanning Tree Protocol)?", answers: ["Verhindert Schleifen im Netzwerk", "Verschlüsselt SSH-Verbindungen", "Komprimiert Netzwerkpakete", "Priorisiert VoIP-Traffic"], correct: 0, roast: "Ohne STP würden Broadcasts ewig im Kreis laufen. Wie dein letztes Meeting." },
    { q: "Welche IP-Range ist Class A privat?", answers: ["192.168.0.0/16", "10.0.0.0/8", "172.16.0.0/12", "169.254.0.0/16"], correct: 1, roast: "10.0.0.0/8 - RFC 1918, auswendig lernen oder Prüfung versemmeln." },
    { q: "Was ist der Zweck von SNMP?", answers: ["Netzwerk-Management und Monitoring", "Sichere Mail-Übertragung", "File Transfer", "Web Hosting"], correct: 0, roast: "SNMP: Simple Network Management Protocol. 'Simple' ist relativ..." },
    { q: "Was ist ein Default Gateway?", answers: ["Die Standard-Website", "Router-Adresse für Traffic außerhalb des Subnetzes", "Der schnellste DNS", "Backup-Server"], correct: 1, roast: "Ohne Default Gateway kommst du nicht raus. Wie ein FISI ohne IHK-Abschluss." },
    { q: "Welches Protokoll nutzt Port 25?", answers: ["HTTP", "SMTP", "POP3", "IMAP"], correct: 1, roast: "Port 25 = SMTP = Mail senden. Port 110 = POP3 = Mail empfangen. Merken!" },
    { q: "Was bedeutet QoS?", answers: ["Quality of Service", "Queue of Systems", "Quick Operating Standard", "Query of Servers"], correct: 0, roast: "QoS: Damit der Chef's VoIP-Call wichtiger ist als dein YouTube-Stream." },

    // Betriebssysteme & Infrastruktur
    { q: "Was ist der Unterschied zwischen einer VM und einem Container?", answers: ["Kein Unterschied", "VM hat eigenes OS, Container teilt Host-Kernel", "Container hat eigenes OS", "VM ist schneller"], correct: 1, roast: "Container = schlank und schnell. VM = eigenes OS, eigene Probleme." },
    { q: "Was ist Active Directory?", answers: ["Ein Telefonbuch für Windows", "Microsofts Verzeichnisdienst für zentrale Netzwerkverwaltung", "Ein Antivirus", "Eine Cloud-Lösung"], correct: 1, roast: "AD: Wo Unternehmen ihre User verwalten und Passwort-Resets genervt bearbeiten." },
    { q: "Was macht der Befehl 'chmod 755'?", answers: ["Löscht eine Datei", "Owner rwx, Group rx, Others rx", "Verschlüsselt eine Datei", "Erstellt einen User"], correct: 1, roast: "rwxr-xr-x. Wenn du das nicht lesen kannst, bist du kein FISI." },
    { q: "Was ist LDAP?", answers: ["Lightweight Directory Access Protocol", "Linux Data Access Point", "Local Domain Auth Protocol", "Long Distance Access Port"], correct: 0, roast: "LDAP: Das Protokoll hinter Active Directory. IHK-Prüfungsliebling Nr. 1." },
    { q: "Welches Dateisystem nutzt Linux standardmäßig?", answers: ["NTFS", "FAT32", "ext4", "HFS+"], correct: 2, roast: "ext4 seit gefühlt einer Ewigkeit. Btrfs lauert aber im Hintergrund." },
    { q: "Was ist ein Hypervisor?", answers: ["Ein sehr schneller Visor", "Software die VMs verwaltet", "Ein Netzwerk-Switch", "Ein Raid-Controller"], correct: 1, roast: "Type 1 = Bare Metal, Type 2 = Hosted. VMware, Hyper-V, KVM..." },
    { q: "Was bedeutet GPO in Windows?", answers: ["General Purpose Output", "Group Policy Object", "Global Protocol Order", "Graphics Processing Object"], correct: 1, roast: "GPOs: Wie der Admin dir sagt was du darfst und was nicht. Wie deine Eltern." },
    { q: "Was ist iSCSI?", answers: ["Ein Apple-Produkt", "Storage-Protokoll über TCP/IP", "Ein Chat-Client", "Intrusion Detection System"], correct: 1, roast: "iSCSI: SAN über normales Netzwerk. Billig und (meistens) funktional." },
    { q: "Was macht der Linux-Befehl 'grep'?", answers: ["Dateien kopieren", "Text in Dateien suchen", "Prozesse beenden", "Netzwerk testen"], correct: 1, roast: "grep = Global Regular Expression Print. Dein bester Freund in der Shell." },
    { q: "Was ist ein Reverse Proxy?", answers: ["Proxy der rückwärts läuft", "Proxy der Anfragen an Backend-Server weiterleitet", "VPN-Alternative", "Firewall-Typ"], correct: 1, roast: "Nginx als Reverse Proxy - steht in jeder zweiten IHK-Aufgabe." },

    // Sicherheit
    { q: "Was ist der Unterschied zwischen symmetrischer und asymmetrischer Verschlüsselung?", answers: ["Kein Unterschied", "Symmetrisch: 1 Key, Asymmetrisch: Public/Private Key-Paar", "Symmetrisch ist unsicher", "Asymmetrisch nutzt keine Keys"], correct: 1, roast: "AES = symmetrisch. RSA = asymmetrisch. Prüfungsrelevant. Sehr." },
    { q: "Was ist ein 'Man-in-the-Middle' Angriff?", answers: ["Jemand steht in der Mitte", "Abfangen von Kommunikation", "Wrestling-Move", "Mittleres Management"], correct: 1, roast: "MITM: Wie der Freund der eure Nachrichten vorliest. Nur krimineller." },
    { q: "Wofür steht CIA in der IT-Sicherheit?", answers: ["Central Intelligence Agency", "Confidentiality, Integrity, Availability", "Computer Internet Access", "Cyber Intelligence Alliance"], correct: 1, roast: "CIA-Triade: Vertraulichkeit, Integrität, Verfügbarkeit. Die heilige Dreifaltigkeit der IT-Security." },
    { q: "Was ist ein 'Phishing'-Angriff?", answers: ["Online angeln", "Betrug durch gefälschte Kommunikation", "Netzwerk-Protokoll", "PHP-Exploit"], correct: 1, roast: "Klicke hier: totally-not-a-scam.com 🎣" },
    { q: "Was ist ein 'Firewall'?", answers: ["Wand aus Feuer", "Netzwerk-Sicherheitssystem", "Heißer Server", "Anti-Virus"], correct: 1, roast: "Firewall: Türsteher des Internets. Lässt trotzdem Mist durch." },
    { q: "Was ist ein IDS?", answers: ["Internet Download System", "Intrusion Detection System", "Internal Data Storage", "Integrated Domain Service"], correct: 1, roast: "IDS erkennt Angriffe, IPS verhindert sie. Merkhilfe: D = Detection, P = Prevention." },
    { q: "Was bedeutet 2FA?", answers: ["Zwei-Faktor-Authentifizierung", "Zwei-Finger-Angriff", "Zweites Firmware-Update", "Doppelte Firewall-Architektur"], correct: 0, roast: "2FA: Weil Passwort123 allein nicht reicht. Und trotzdem nutzen es nicht alle..." },
    { q: "Was ist Social Engineering?", answers: ["Soziale Netzwerke bauen", "Manipulation von Menschen für Informationszugang", "Teambuilding", "Marketing-Strategie"], correct: 1, roast: "Größte Sicherheitslücke: Der Mensch. Firewall zwischen den Ohren fehlt oft." },
    { q: "Was ist ein Zero-Day-Exploit?", answers: ["Exploit am Montag", "Angriff auf unbekannte Schwachstelle ohne Patch", "Exploit der 0 Schaden macht", "Backup am Tag 0"], correct: 1, roast: "Zero-Day: Die Schwachstelle existiert, aber der Hersteller weiß es noch nicht. Ups." },

    // Projektmanagement & Wirtschaft (IHK liebt das)
    { q: "Was ist ein Lastenheft?", answers: ["Beschreibung der Anforderungen durch den Auftraggeber", "Technische Umsetzung", "Testprotokoll", "Benutzerhandbuch"], correct: 0, roast: "Lastenheft = WAS der Kunde will. Pflichtenheft = WIE du es umsetzt. IHK-Klassiker." },
    { q: "Was ist ein Pflichtenheft?", answers: ["Kundenwünsche", "Technische Umsetzungsbeschreibung des Auftragnehmers", "Arbeitsvertrag", "Prüfprotokoll"], correct: 1, roast: "Pflichtenheft ≠ Lastenheft. Wer das verwechselt, fällt durch. Garantiert." },
    { q: "Was bedeutet 'Scrum' in der Softwareentwicklung?", answers: ["Ein Rugby-Begriff der für agile Sprints steht", "Software Controlled Resource Update Management", "System Check Running Update Module", "Schnelles Coding"], correct: 0, roast: "Scrum: Daily Standups, Sprints, Retrospektiven. Buzzword-Bingo at its finest." },
    { q: "Welches Diagramm zeigt den zeitlichen Ablauf eines Projekts?", answers: ["UML-Diagramm", "Gantt-Diagramm", "ER-Diagramm", "Netzplan"], correct: 1, roast: "Gantt-Chart: Wo dein Projektplan perfekt aussieht und die Realität anders entscheidet." },
    { q: "Was ist ein SLA?", answers: ["Super Long Agreement", "Service Level Agreement", "System Load Analyzer", "Standard Linux Architecture"], correct: 1, roast: "SLA: Das Dokument das definiert wie oft dein Service down sein darf. Spoiler: Zu oft." },
    { q: "Was ist 'Total Cost of Ownership' (TCO)?", answers: ["Nur Anschaffungskosten", "Gesamtkosten über die Nutzungsdauer inkl. Betrieb und Wartung", "Stundenlohn eines Technikers", "Kosten der Internetleitung"], correct: 1, roast: "TCO: Wenn der billige Server am Ende doch teurer wird. Überraschung!" },

    // Datenbanken
    { q: "Was ist ein Primary Key?", answers: ["Der wichtigste Schlüssel im Büro", "Eindeutiger Bezeichner für Datensätze in einer Tabelle", "Passwort für die DB", "Erster Eintrag in der Tabelle"], correct: 1, roast: "Primary Key: Unique und NOT NULL. Wie dein Kaffee am Morgen." },
    { q: "Was bedeutet 'Normalisierung' in Datenbanken?", answers: ["Daten löschen", "Redundanzen eliminieren und Datenstrukturen optimieren", "Datenbank neu starten", "Alle Tabellen gleich groß machen"], correct: 1, roast: "1NF, 2NF, 3NF... wer das nicht kann, normalisiert seine Daten per Hand." },
    { q: "Was ist ein Foreign Key?", answers: ["Schlüssel aus dem Ausland", "Verweis auf den Primary Key einer anderen Tabelle", "Backup-Schlüssel", "Verschlüsselter Key"], correct: 1, roast: "Foreign Key = Beziehung zwischen Tabellen. Wie Tinder, nur für Datenbanken." },
    { q: "Was macht ein JOIN in SQL?", answers: ["Tritt einem Server bei", "Verknüpft Daten aus mehreren Tabellen", "Löscht Duplikate", "Erstellt eine neue Tabelle"], correct: 1, roast: "INNER JOIN, LEFT JOIN, RIGHT JOIN, FULL JOIN... die IHK testet ALLE." },
    { q: "Was ist der Unterschied zwischen DELETE und TRUNCATE?", answers: ["Kein Unterschied", "DELETE kann WHERE haben, TRUNCATE löscht alles ohne Log", "TRUNCATE ist langsamer", "DELETE löscht die Tabelle"], correct: 1, roast: "TRUNCATE: 'Alles weg, keine Fragen.' DELETE: 'Moment, was genau?'" },
    { q: "Was bedeutet ACID bei Datenbanken?", answers: ["Eine Säure", "Atomicity, Consistency, Isolation, Durability", "Automatic Cleanup and Data", "Advanced Configuration Interface Driver"], correct: 1, roast: "ACID: Damit deine Transaktion nicht nur 'halb' durchgeht. Wie eine Beziehung." },

    // Programmierung & Grundlagen
    { q: "Was ist der Unterschied zwischen Compiler und Interpreter?", answers: ["Kein Unterschied", "Compiler übersetzt komplett, Interpreter Zeile für Zeile", "Interpreter ist schneller", "Compiler nur für Java"], correct: 1, roast: "C = Compiler. Python = Interpreter. Java = Beides irgendwie. Classic IHK." },
    { q: "Was ist ein API?", answers: ["Application Programming Interface", "Automatic Program Installation", "Advanced Programming Intelligence", "All Programs Included"], correct: 0, roast: "Ohne APIs wäre das Internet wie Faxen. Manche Behörden faxen aber immer noch." },
    { q: "Was ist JSON?", answers: ["JavaScript Object Notation", "Just Some Old Nonsense", "Java Server Object Network", "Joint Standard Online Network"], correct: 0, roast: "JSON: Weil XML zu verbose war und CSV zu primitiv." },
    { q: "Was ist ein ERP-System?", answers: ["Error Recovery Process", "Enterprise Resource Planning", "Extended Runtime Protocol", "Emergency Response Platform"], correct: 1, roast: "SAP, Oracle, Microsoft Dynamics... wo Unternehmen Millionen für Software ausgeben die keiner versteht." },
    { q: "Was ist ein ER-Diagramm?", answers: ["Error-Report Diagramm", "Entity-Relationship-Diagramm für Datenbankdesign", "Ethernet-Router Diagramm", "Emergency Response Diagramm"], correct: 1, roast: "ER-Diagramm: Kästchen und Linien malen für Erwachsene. IHK-Prüfung mandatory." },
    { q: "Welche IP-Version nutzt 128-Bit Adressen?", answers: ["IPv4", "IPv6", "IPv8", "IPv5"], correct: 1, roast: "IPv6: 128 Bit, genug Adressen für jedes Sandkorn auf der Erde. Und trotzdem nutzen wir noch v4." },
    { q: "Was ist ITIL?", answers: ["IT Infrastructure Library", "Internet Technology Integration Layer", "Information Transfer Integration Link", "IT Internal Logistics"], correct: 0, roast: "ITIL: Best Practices für IT-Service-Management. Die IHK liebt ITIL. LIEBT es." },
    { q: "Was ist ein Backup-Typ: Inkrementell?", answers: ["Sichert alles", "Sichert nur Änderungen seit dem letzten Backup", "Sichert nur Montags", "Sichert in die Cloud"], correct: 1, roast: "Voll > Differentiell > Inkrementell. Wer das verwechselt, verliert seine Daten." },
    { q: "Was ist der Unterschied zwischen IMAP und POP3?", answers: ["Kein Unterschied", "IMAP synchronisiert, POP3 lädt Mails runter und löscht vom Server", "POP3 ist neuer", "IMAP ist unsicherer"], correct: 1, roast: "IMAP = Mails bleiben auf dem Server. POP3 = Mails runter und weg. IHK testet das." },
    { q: "Was ist ein USV?", answers: ["Unterbrechungsfreie Stromversorgung", "Universal System Verbindung", "Update Service Version", "Unified Security Validator"], correct: 0, roast: "USV: Damit dein Server bei Stromausfall nicht einfach stirbt. Kinda wichtig." },
    { q: "Was bedeutet 'Hot Standby'?", answers: ["Server der warm läuft", "Sofort einsatzbereites Redundanzsystem", "Heiße Reserve-Festplatte", "Übertakteter Backup-PC"], correct: 1, roast: "Hot Standby = sofort da. Cold Standby = muss erst hochfahren. Warm = irgendwo dazwischen." },
    { q: "Was ist ein Ticket-System?", answers: ["Online-Kino-Buchung", "Tool zur Verwaltung von IT-Support-Anfragen", "Parkschein-Automat", "Bug-freie Software"], correct: 1, roast: "OTRS, Jira, ServiceNow... wo Support-Anfragen sterben gehen." },
    { q: "Was ist ein Subnetz?", answers: ["Ein U-Boot-Netzwerk", "Logische Unterteilung eines IP-Netzwerks", "Subwoofer-Netzwerk", "Alternatives Internet"], correct: 1, roast: "Subnetting: Die Kunst, ein Netz in kleinere Netze zu teilen. IHK-Dauerbrenner." },
    { q: "Was ist ein Proxy-Server?", answers: ["Ein Stellvertreter-Server der Anfragen weiterleitet", "Ein Backup-Server", "Ein DNS-Server", "Ein Gaming-Server"], correct: 0, roast: "Proxy: Der Mittelsmann des Internets. Wie ein Anwalt, nur für Pakete." },
    { q: "Was ist ein Cronjob?", answers: ["Zeitgesteuerte wiederkehrende Aufgabe unter Linux", "Ein Chrome-Extension", "Virenscanner", "Cloud-Backup"], correct: 0, roast: "Crontab: * * * * * - Wenn du das lesen kannst, bist du ein richtiger Admin." },
    { q: "Was ist NAS?", answers: ["Network Attached Storage", "New Advanced System", "National Admin Service", "Node Application Server"], correct: 0, roast: "NAS: Dein persönliches Cloud-Replacement. Synology-Jünger everywhere." },
    { q: "Wofür steht VPN?", answers: ["Very Private Network", "Virtual Private Network", "Virtual Protocol Node", "Visual Programming Network"], correct: 1, roast: "VPN: Damit du 'sicher' von Zuhause arbeiten kannst. Und Netflix US schauen." },
    { q: "Was ist ein BIOS?", answers: ["Basic Input/Output System", "Binary Internet Operating Standard", "Boot Integration OS", "Base Infrastructure Object System"], correct: 0, roast: "BIOS bzw. UEFI: Das erste was dein PC sieht. Noch bevor Windows abstürzt." },
    { q: "Was ist ein Datensicherungskonzept nach BSI?", answers: ["Einmal im Jahr Backup", "Regelwerk für systematische Datensicherung mit 3-2-1 Regel", "Cloud-Only Strategie", "RAID reicht"], correct: 1, roast: "3-2-1 Regel: 3 Kopien, 2 Medien, 1 Offsite. Das BSI hat gesprochen." },
  ],

  // ── ALLGEMEINWISSEN ───────────────────────────────────────────────────
  allgemein: [
    { q: "In welchem Jahr wurde das World Wide Web erfunden?", answers: ["1985", "1989", "1995", "2001"], correct: 1, roast: "Tim Berners-Lee, 1989. Dafür dass du das Internet benutzt, weißt du erstaunlich wenig darüber." },
    { q: "Wer hat Python entwickelt?", answers: ["Guido van Rossum", "Linus Torvalds", "Bill Gates", "Elon Musk"], correct: 0, roast: "Guido van Rossum, benannt nach Monty Python. Nicht nach der Schlange." },
    { q: "Was war das erste Computervirus?", answers: ["ILOVEYOU", "Brain", "Creeper", "MyDoom"], correct: 2, roast: "Creeper, 1971. Es hat nur 'I'm the creeper, catch me if you can!' angezeigt. Wholesome Malware." },
    { q: "Welche Firma hat Android entwickelt?", answers: ["Google", "Apple", "Samsung", "Android Inc. (dann Google)"], correct: 3, roast: "Android Inc. wurde 2003 gegründet und 2005 von Google gekauft. Plot Twist!" },
    { q: "Was bedeutet 'LAN'?", answers: ["Large Area Network", "Local Area Network", "Long Access Node", "Linux Admin Network"], correct: 1, roast: "LAN-Party: Wo man sich trifft um gemeinsam Netzwerkprobleme zu debuggen." },
    { q: "Wer hat Linux erstellt?", answers: ["Bill Gates", "Steve Jobs", "Linus Torvalds", "Mark Zuckerberg"], correct: 2, roast: "Linus Torvalds, 1991. Weil MINIX ihm nicht gut genug war. Mood." },
    { q: "Was ist 'Machine Learning'?", answers: ["Maschinen in der Schule", "Algorithmen die aus Daten lernen", "Automatische Updates", "PC repariert sich selbst"], correct: 1, roast: "ML: Statistik mit einem fancy Marketing-Budget. Change my mind. 🤖" },
    { q: "Was ist 'Pair Programming'?", answers: ["Zwei Entwickler, ein Rechner", "Programmieren auf Dates", "Zwei Monitore", "Copy-Paste von Stack Overflow"], correct: 0, roast: "Pair Programming: Doppelte Kosten, halbe Produktivität, dreifacher Spaß. Angeblich." },
    { q: "Was war der erste grafische Webbrowser?", answers: ["Internet Explorer", "Mosaic", "Netscape", "Firefox"], correct: 1, roast: "Mosaic, 1993. Deine Eltern haben damit zum ersten Mal 'Bilder im Internet' gesehen." },
    { q: "Wie viele Bits hat ein Byte?", answers: ["4", "8", "16", "32"], correct: 1, roast: "8 Bit = 1 Byte. Wenn du das nicht wusstest, Google bitte 'Karrierewechsel'." },
  ],
};

// ── CATEGORY METADATA ───────────────────────────────────────────────────
const categories = {
  it: { name: 'IT Allgemein', icon: '💻' },
  allgemein: { name: 'Allgemeinwissen', icon: '🌍' },
};

module.exports = { quizQuestions, categories };
