const express = require("express");

const bcrypt = require("bcrypt");

const jwt = require("jsonwebtoken");

const pool = require("../db");

require("dotenv").config();

const router = express.Router();

router.post(
  "/register",
  async (req, res) => {

    try {

      const {
        username,
        email,
        password,
      } = req.body;

      console.log(
        "REGISTER REQUEST"
      );

      console.log(req.body);

      const hashedPassword =
        await bcrypt.hash(
          password,
          10
        );

      const result =
        await pool.query(
          `
          INSERT INTO users
          (
            username,
            email,
            password
          )
          VALUES
          (
            $1,
            $2,
            $3
          )
          RETURNING
          id,
          username,
          email,
          role
          `,
          [
            username,
            email,
            hashedPassword,
          ]
        );

      res.status(201).json({
        message:
          "User registered successfully",
        user:
          result.rows[0],
      });

    } catch (error) {

      console.error(error);

      res.status(500).json({
        error:
          "Registration failed",
      });
    }
  }
);

router.post(
  "/login",
  async (req, res) => {

    try {

      const {
        email,
        password,
      } = req.body;

      console.log(
        "LOGIN ATTEMPT"
      );

      console.log(email);

      console.log(password);

      const result =
        await pool.query(
          `
          SELECT *
          FROM users
          WHERE email = $1
          `,
          [email]
        );

      console.log(result.rows);

      if (
        result.rows.length === 0
      ) {

        return res.status(401).json({
          error:
            "Invalid email or password",
        });
      }

      const user =
        result.rows[0];

      console.log(user);

      const validPassword =
        await bcrypt.compare(
          password,
          user.password
        );

      console.log(
        "PASSWORD MATCH"
      );

      console.log(
        validPassword
      );

      if (!validPassword) {

        return res.status(401).json({
          error:
            "Invalid email or password",
        });
      }

      const token =
        jwt.sign(
          {
            id: user.id,
            email: user.email,
            role: user.role,
          },
          process.env.JWT_SECRET,
          {
            expiresIn: "1d",
          }
        );

      res.json({
        message:
          "Login successful",
        token,
      });

    } catch (error) {

      console.error(error);

      res.status(500).json({
        error:
          "Login failed",
      });
    }
  }
);

module.exports = router;
