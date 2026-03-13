(function () {
  "use strict";

  // mechanism.js
  // Modul mekanisme internal: simulasi arsitektur (monolitik vs mikro),
  // replikasi data (replica / backup), dan contoh optimasi DB pada tingkat
  // mikroservice. File ini tidak menampilkan apa pun di halaman — hanya
  // menyediakan fungsi/objek sebagai mekanisme internal.
  // Untuk debug: panggil `window.__mechanism__.simulate()` di console.

  // ----- Helper: contoh array 1D dan 2D + loop -----
  class ArrayExamples {
    constructor() {
      // 1-dimensi: daftar entri sederhana
      this.list = ["alpha", "beta", "gamma"];
      // 2-dimensi: matrix/replica layout (baris = shard/replica)
      this.matrix = [
        [1, 2, 3],
        [4, 5, 6],
      ];
    }

    // contoh perulangan (loop)
    iterateExamples() {
      const results = {
        forLoop: [],
        nestedLoop: [],
        forEachLoop: [],
        whileLoop: [],
      };

      // for loop 1-dimensi
      for (let i = 0; i < this.list.length; i++) {
        results.forLoop.push(this.list[i].toUpperCase());
      }

      // nested loop 2-dimensi
      for (let r = 0; r < this.matrix.length; r++) {
        const row = [];
        for (let c = 0; c < this.matrix[r].length; c++) {
          row.push(this.matrix[r][c] * 2);
        }
        results.nestedLoop.push(row);
      }

      // forEach
      this.list.forEach((s) => results.forEachLoop.push(s.length));

      // while loop example
      let idx = 0;
      while (idx < this.list.length) {
        results.whileLoop.push(this.list[idx].slice(0, 1));
        idx += 1;
      }

      return results;
    }
  }

  // ----- Class: DataReplica -----
  // Simulasi pencadangan / replikasi data sederhana.
  class DataReplica {
    constructor() {
      // primary store (1D array)
      this.primary = [];
      // replicas (2D array): array of arrays
      this.replicas = [];
    }

    createReplicas(count) {
      // inisiasi sejumlah replica kosong
      this.replicas = [];
      for (let i = 0; i < count; i++) {
        this.replicas.push([]);
      }
    }

    // tambahkan entri ke primary dan push ke semua replica (synchronous)
    addToPrimary(entry) {
      this.primary.push(entry);
      // contoh penggunaan loop untuk menyalin ke setiap replica
      for (let i = 0; i < this.replicas.length; i++) {
        this.replicas[i].push(entry);
      }
    }

    // sinkronkan replica tertentu dengan primary (bulk copy)
    syncReplica(index) {
      if (this.replicas[index]) {
        // shallow copy saja; dalam dunia nyata gunakan mekanisme incremental
        this.replicas[index] = this.primary.slice();
      }
    }

    // dapatkan snapshot (tidak menampilkan ke UI)
    snapshot() {
      return {
        primary: this.primary.slice(),
        replicas: this.replicas.map((r) => r.slice()),
      };
    }
  }

  // ----- Class: Service -----
  // Representasi microservice sederhana yang menyimpan datanya sendiri.
  class Service {
    constructor(name) {
      this.name = name;
      this.store = []; // 1D array data milik service
    }

    insert(record) {
      // minimal validation (contoh)
      if (!record || typeof record !== "object") return false;
      // example loop: assign numeric id
      record._id = this.store.length + 1;
      this.store.push(record);
      return record;
    }

    find(predicate) {
      // gunakan loop sederhana untuk mencari
      const out = [];
      for (let i = 0; i < this.store.length; i++) {
        if (predicate(this.store[i])) out.push(this.store[i]);
      }
      return out;
    }
  }

  // ----- Coordinator: monolith vs microservice simulation -----
  class Coordinator {
    constructor(mode = "monolith") {
      // mode: 'monolith' atau 'micro'
      this.mode = mode;
      // jika monolitik: satu service tunggal menyimpan semua tabel
      this.monolithService = new Service("monolith");
      // jika micro: beberapa service per-domain
      this.services = {
        users: new Service("users"),
        jobs: new Service("jobs"),
        payments: new Service("payments"),
      };
      // sebuah DataReplica yang merepresentasikan backup/replica layer
      this.replica = new DataReplica();
      this.replica.createReplicas(2); // default 2 backup replicas
    }

    // insert data ke sistem tergantung arsitektur
    insert(domain, record) {
      if (this.mode === "monolith") {
        // di monolitik semua domain ke monolithService
        const saved = this.monolithService.insert(
          Object.assign({ domain }, record)
        );
        this.replica.addToPrimary({ service: "monolith", data: saved });
        return saved;
      }

      // microservice mode: route ke service domain
      const svc = this.services[domain];
      if (!svc) return null;
      const saved = svc.insert(record);
      this.replica.addToPrimary({ service: domain, data: saved });
      return saved;
    }

    query(domain, predicate) {
      if (this.mode === "monolith") {
        return this.monolithService.find(
          (r) => r.domain === domain && predicate(r)
        );
      }
      const svc = this.services[domain];
      if (!svc) return [];
      return svc.find(predicate);
    }

    // contoh optimasi sederhana: 'indexing' in-memory per microservice
    buildIndex(domain, key) {
      const svc =
        this.mode === "monolith" ? this.monolithService : this.services[domain];
      if (!svc) return null;
      const index = Object.create(null);
      for (let i = 0; i < svc.store.length; i++) {
        const item = svc.store[i];
        const value = item[key];
        if (value === undefined) continue;
        if (!index[value]) index[value] = [];
        index[value].push(item);
      }
      return index;
    }

    // helper: snapshot of replica and services (no UI)
    snapshot() {
      return {
        mode: this.mode,
        replica: this.replica.snapshot(),
        monolith: this.monolithService.store.slice(),
        services: Object.keys(this.services).reduce((acc, k) => {
          acc[k] = this.services[k].store.slice();
          return acc;
        }, {}),
      };
    }
  }

  // ----- Public API (exposed on window for optional debugging) -----
  const mech = {
    ArrayExamples,
    DataReplica,
    Service,
    Coordinator,
    // run a compact simulation that returns internal snapshots (no console/UI)
    simulate: function () {
      const arrays = new ArrayExamples();
      const loopResults = arrays.iterateExamples();

      const coord = new Coordinator("micro");
      // isi beberapa data pada microservice
      coord.insert("users", { name: "Siti", email: "siti@example.com" });
      coord.insert("jobs", { title: "Frontend Dev", company: "Acme" });
      coord.insert("users", { name: "Budi", email: "budi@example.com" });

      // bangun index sederhana pada users.email
      const userIndex = coord.buildIndex("users", "email");

      // snapshot semua state internal agar caller dapat memeriksa
      const snap = coord.snapshot();

      return {
        loops: loopResults,
        indexSample: userIndex,
        stateSnapshot: snap,
      };
    },
  };

  // expose but keep off UI; developer can inspect via console
  if (typeof window !== "undefined") {
    Object.defineProperty(window, "__mechanism__", {
      configurable: false,
      enumerable: false,
      value: mech,
      writable: false,
    });
  }

  // Tidak ada aksi otomatis — mekanisme tersedia untuk dipanggil saat diperlukan.
})();
