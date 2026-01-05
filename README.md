# Declarative Batch Archetype Generator

🚀 **Declarative Batch Archetype Generator** è un servizio **Node.js** che espone una **API REST** per generare automaticamente un progetto **Spring Batch** a partire da:

* un **Maven Archetype** predefinito
* una **definizione dichiarativa** del batch (metadata, step, DTO, configurazione)

Il risultato finale è un **file ZIP** contenente un progetto **Maven completo**, pronto per essere importato in IDE ed eseguito.

---

## 🎯 Obiettivi

Il progetto nasce per:

* Generare progetti **Spring Batch** in modo **dichiarativo**
* Ridurre il **boilerplate** manuale
* Standardizzare **struttura**, **naming** e **convenzioni** dei batch
* Abilitare un flusso completo **Frontend → Backend → ZIP**
* Accelerare la creazione di nuovi batch enterprise

---

## 🏗️ Architettura

Flusso di alto livello:

1. Un **frontend** invia la definizione del batch (metadata, step, YAML)
2. Il **backend Node.js**:

   * genera un progetto Maven a partire da un **Maven Archetype**
   * scrive `application.yml`
   * genera **Step / Tasklet / DTO** tramite template
3. Il progetto viene compresso in un **file ZIP**
4. Il **ZIP** viene restituito al client come risposta HTTP

```
Frontend
   │
   ▼
API REST (Node.js)
   │
   ├─ Maven Archetype
   ├─ Template Java (Handlebars)
   └─ application.yml
   │
   ▼
ZIP progetto Spring Batch
```

---

## 🧰 Tecnologie

* **Node.js**
* **Express**
* **Maven Archetype**
* **Handlebars** (template Java)
* **Spring Batch** (nel progetto generato)

---

## 📦 Maven Archetype

Il servizio utilizza il seguente archetype Maven:

```bash
groupId: com.marbl.declarative-batch
artifactId: declarative-batch-archetype
version: 0.0.1-SNAPSHOT
```

L'archetype definisce la struttura base del progetto Spring Batch (configurazione, package, dipendenze).

---

## ▶️ Avvio del progetto

### Prerequisiti

* Node.js >= 18
* Maven installato e disponibile nel PATH

### Avvio

```bash
npm install
node index.js
```

Il server sarà disponibile su:

```bash
http://localhost:3000
```

---

## 📡 API

### POST `/generate-zip`

Genera un progetto Maven Spring Batch e restituisce un **file ZIP**.

#### Request Body

```json
{
  "batch": {
    "groupId": "com.example",
    "artifactId": "demo-batch",
    "pkg": "com.example.batch",
    "version": "0.0.1-SNAPSHOT",
    "generatedYaml": "spring:\n  application:\n    name: demo-batch",
    "steps": [
      {
        "name": "ExampleStep",
        "type": "STEP",
        "input": {
          "className": "InputRecord",
          "fields": [
            { "name": "id", "type": "String" }
          ]
        },
        "output": {
          "className": "OutputRecord",
          "fields": [
            { "name": "status", "type": "String" }
          ]
        }
      }
    ]
  }
}
```

#### Response

* **Content-Type:** `application/zip`
* **Body:** file ZIP contenente il progetto Maven Spring Batch

---

## 🧩 Cosa viene generato

All'interno del ZIP:

* Progetto **Maven** basato su archetype
* `application.yml` generato dinamicamente
* Classi Java:

  * Step / Tasklet
  * DTO di input e output
  * Configurazioni Spring Batch
* Struttura package coerente con i metadata forniti

---

## 🔮 Estensioni future

* Supporto a **Chunk-oriented Step**
* Validazione schema JSON/YAML
* Generazione **Job Flow** complessi
* Supporto a **listener**, **retry**, **skip policy**
* UI Frontend dedicata

---

## 📄 Licenza

© 2026 – Tutti i diritti riservati.

Il presente software e il relativo codice sorgente sono di esclusiva proprietà dell'autore.

All rights reserved.

Nessuna parte di questo software può essere riprodotta, distribuita, modificata, pubblicata o utilizzata, in alcuna forma e con alcun mezzo, senza la preventiva autorizzazione scritta dell'autore.
