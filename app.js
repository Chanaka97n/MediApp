const express = require("express");
const mysql = require("mysql");
const app = express();
const port = 3000;
const cors = require("cors");
const bodyParser = require("body-parser");
app.use(cors());
app.use(bodyParser.json());
app.use(express.json());
const dbConfig = require("./lib/db");
const router = require("./routes/routes");

app.use("/api", router);

//ViewAllDrugs
app.get("/allDrugs", (req, res) => {
  let sql = `SELECT * FROM drugs  `;
  dbConfig.query(sql, (err, rows) => {
    if (err) {
      console.log(err);
      throw err;
    } else {
      res.json(rows);
    }
  });
});

//ViewAllDrugs
app.get("/allOptions", (req, res) => {
  const jsonResponse = { options: [] };
  let disName = `SELECT  DISTINCT d_name FROM  drugs  `;
  let disBrand = `SELECT  DISTINCT d_brand FROM  drugs  `;
  dbConfig.query(disName, (error, results1) => {
    if (error) throw error;
    jsonResponse.options = jsonResponse.options.concat(results1);
    dbConfig.query(disBrand, (error, results2) => {
      if (error) throw error;
      jsonResponse.options = jsonResponse.options.concat(results2);
      res.json(jsonResponse);
    });
  });
});

//SerarchAllDrugs InsideBody
app.get("/searchDrugs", (req, res) => {
  let searchTerm = req.query.item;

  let sql = `SELECT * FROM drugs WHERE d_name = '${searchTerm}' OR d_brand = '${searchTerm}' `;

  dbConfig.query(sql, (err, rows) => {
    if (err) {
      console.log(err);
      throw err;
    } else {
      if (rows && rows.length > 0) {
        res.json(rows);
      } else {
        res.json("There is no such kind of Drug name or brand");
      }
    }
  });
});

//Insert Drugs
app.post("/addDrugs", (req, res) => {
  const { d_name, d_brand } = req.body;

  if (d_name) {
    let check = `SELECT * FROM drugs WHERE d_name = '${d_name}' AND d_brand = '${d_brand}'`;
    let sql = `INSERT INTO drugs (d_name, d_brand) VALUES ('${d_name}','${d_brand}')`;
    dbConfig.query(check, (err, rows) => {
      if (err) {
        console.log(err);
        return res.status(500).json({ error: "Internal Server Error " });
      }
      if (rows.length > 0) {
        return res.status(422).json({ error: "Drug already exists" });
      } else {
        // If the drug does not exist, insert it into the database
        dbConfig.query(sql, (err) => {
          if (err) {
            console.log(err);
            return res
              .status(500)
              .json({ error: "Failed to insert data into the database" });
          }
          return res
            .status(201)
            .json({ message: "Drug inserted successfully" });
        });
      }
    });
  } else {
    return res
      .status(400)
      .json({ message: "Failed to insert data,Genetic Drug Name " });
  }
});

//UpdateDrug
app.put("/updateDrug", (req, res) => {
  // const drugId = req.params.id; // Get the drug ID from the route parameter
  const { id, d_name, d_brand } = req.body; // Get the updated values from the request body
  let check = `SELECT * FROM drugs WHERE d_name = '${d_name}' AND d_brand = '${d_brand}'`;
  let sql = `UPDATE drugs SET d_name = '${d_name}', d_brand = '${d_brand}' WHERE id = '${id}' `;
  let idCheck = `SELECT id FROM drugs WHERE id = '${id}' `;

  dbConfig.query(check, (err, rows) => {
    if (err) {
      console.log(err);
      return res.status(500).json({ error: "Internal Server Error " });
    }
    if (rows.length > 0) {
      return res.status(409).json({ error: "Drug already exists" });
    } else {
      dbConfig.query(idCheck, (err, idRes) => {
        if (err) {
          return res.status(500).json({ error: "Internal Server Error " });
        }

        if (idRes.length == 0) {
          return res.status(409).json({ error: "Wrong ID " + id });
        } else {
          // If the drug does not exist, Update it into the database
          dbConfig.query(sql, (err, result) => {
            if (err) {
              console.log(err);
              return res
                .status(500)
                .json({ error: "Failed to Update data into the database" });
            }
            return res
              .status(201)
              .json({ message: "Drug Updated successfully" });
          });
        }
      });
    }
  });
});

//Delete
app.delete("/deleteDrug", (req, res) => {
  const id = req.query.id;

  if (!id) {
    res.status(400).json({ error: "Drug ID is missing in the request query." });
    return;
  }

  let sql = `DELETE FROM drugs WHERE id=${id}`;
  dbConfig.query(sql, (err, results) => {
    if (err) {
      console.error("Error deleting drug:", err);
      return res.status(500).json({ err: "Error deleting drug" });
    }

    if (results.affectedRows === 0) {
      return res.status(404).json({ err: "Drug not found" });
    }
    res.json({ message: "Drug deleted successfully" });
  });
});

app.listen(port, () => {
  console.log("App is running on port :", port);
});
