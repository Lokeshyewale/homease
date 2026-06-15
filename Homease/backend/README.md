# Homease Backend

This is the Spring Boot backend for the Homease application.

## Prerequisites
- Java 17+
- Maven
- MySQL Database

## Setup
1. **Database**: Create a MySQL database named `homease`.
   ```sql
   CREATE DATABASE homease;
   ```
2. **Configuration**: Open `src/main/resources/application.properties` and update your MySQL username and password if different from `root/root`.
   ```properties
   spring.datasource.username=YOUR_USERNAME
   spring.datasource.password=YOUR_PASSWORD
   ```

## Running the Application
Open this project in VS Code or Terminal and run:

```bash
mvn spring-boot:run
```

The server will start on **http://localhost:4000**.

## API Endpoints
- **Auth**: `/api/auth/login`, `/api/auth/signup`
- **Services**: `/api/service/list`
- **Cart**: `/api/cart/add`, `/api/cart/get`
- **Order**: `/api/orders/create-order`

## Folder Structure
- `controller`: REST API endpoints
- `service`: Business logic
- `repository`: Database interaction
- `entity`: Database models
