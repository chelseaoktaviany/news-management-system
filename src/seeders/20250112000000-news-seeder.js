"use strict";

const { publishNewsIndex } = require("../services/mq.service");

module.exports = {
  async up(queryInterface, Sequelize) {
    const data = [
      {
        title:
          "Pemerintah Resmikan Proyek Energi Terbarukan Terbesar di Asia Tenggara",
        content:
          "Pemerintah meresmikan proyek energi terbarukan yang diklaim sebagai terbesar di Asia Tenggara, meliputi pembangkit tenaga surya dan angin.",
        author: "Dewi Lestari",
        source: "Kompas",
        created_at: new Date("2025-01-12 08:45:00"),
      },
      {
        title: "Startup Lokal Raih Pendanaan Seri B Senilai 150 Miliar Rupiah",
        content:
          "Startup teknologi lokal mendapatkan pendanaan seri B untuk memperluas layanan dan mengembangkan teknologi AI.",
        author: "Andi Pratama",
        source: "TechDaily",
        created_at: new Date("2025-02-03 10:21:00"),
      },
      {
        title: "Cuaca Ekstrem Diprediksi Melanda Sejumlah Wilayah di Indonesia",
        content:
          "BMKG memperingatkan potensi cuaca ekstrem termasuk hujan deras dan angin kencang dalam beberapa hari ke depan.",
        author: "Sari Kurnia",
        source: "BMKG News",
        created_at: new Date("2025-01-27 15:10:00"),
      },
      {
        title: "Timnas Indonesia Lolos ke Final Piala Asia U-23",
        content:
          "Timnas Indonesia U-23 melaju ke final setelah mengalahkan lawan berat dalam pertandingan dramatis.",
        author: "Rian Mahardika",
        source: "SportZone",
        created_at: new Date("2025-02-01 20:30:00"),
      },
      {
        title: "Harga Beras Naik 12% Akibat Gangguan Distribusi",
        content:
          "Kenaikan harga beras akibat gangguan distribusi dan menurunnya pasokan selama dua minggu terakhir.",
        author: "Putri Wulandari",
        source: "EkonomiID",
        created_at: new Date("2025-01-25 09:05:00"),
      },
    ];

    // insert data into the "news" table
    await queryInterface.bulkInsert("news", data);

    // take all datas from mysql database
    const inserted = await queryInterface.sequelize.query(
      `SELECT * FROM news ORDER BY id DESC LIMIT ${data.length}`,
      { type: Sequelize.QueryTypes.SELECT }
    );

    // publish one per one to rabbitmq
    for (const news of inserted) {
      await publishNewsIndex(news);
    }

    console.log(
      `Published ${inserted.length} seeded news to RabbitMQ for indexing.`
    );
  },

  async down(queryInterface) {
    return queryInterface.bulkDelete("news", null, {});
  },
};
