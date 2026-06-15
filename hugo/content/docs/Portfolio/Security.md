# Security Projects

## Local NVD Database
[![GitHub: LittleSeneca/local-nvd](https://img.shields.io/badge/GitHub-LittleSeneca%2Flocal--nvd-181717?logo=github&logoColor=white)](https://github.com/LittleSeneca/local-nvd)

This project automates pulling down the full NIST National Vulnerability Database, minus the current year, and loads it into PostgreSQL. It sets up the server, creates the tables, and runs the scripts that collect the data and push it in.

The reason to want this is control. Once the NVD lives in your own database, you can query it, join it against your asset inventory, and run the kind of analysis the public web interface will not give you. It is built for security teams, researchers, and admins who would rather own the data than poke at it through someone else's UI.
