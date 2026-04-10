# webedit-react – Blinkenstar WebInterface

Visit the deployed application at: [http://your-domain.com/webedit-react](http://your-domain.com/webedit-react)

## Quickstart

#### Frontend Setup

- Install Node.js 20.17.0 or newer: https://nodejs.org/en/download/
- Use Yarn 1.22.22 or newer (or npm if you prefer the npm scripts)

#### Getting Started with the Code

Clone the Git repository, then run the following commands:

    yarn
    yarn build

To run the development server:

    yarn dev

To run the frontend and local PHP backend together:

    yarn dev:all

To run the PHP backend only:

    yarn backend

You can now access the web interface at [http://127.0.0.1:8080](http://127.0.0.1:8080).
The local API is served at [http://localhost:8000](http://localhost:8000).

#### Backend Setup (PHP & MySQL)

This project now uses a REST API built in PHP with MySQL on a standard LAMP stack.

1. **Database Initialization:**  
   Execute the provided SQL statements (see the database documentation) to create the following tables:
    - `users`
    - `animations`
    - `public_gallery`

2. **Deploy the API:**  
   Place the PHP scripts (db.php, signup.php, login.php, logout.php, user.php, animations.php, animation.php, gallery.php, admin-gallery.php, review.php) in an `/api` directory on your LAMP server and adjust the database credentials in **db.php** accordingly.

3. **Session & Security:**  
   Ensure PHP sessions are enabled and configure your server to use HTTPS in production.  
   Use the provided endpoints to handle signup, login, and CRUD operations for animations.

#### Deployment

##### Frontend Deployment

Build the production bundle:

    yarn build

Deploy the contents of the `public` directory to your web server.

##### Backend Deployment

Deploy your PHP API scripts (in the `/api` directory) on your LAMP stack. Confirm that your database is properly set up and that your Apache (or similar) server is configured to serve these scripts (including any URL rewriting if desired).

## Database Setup

Refer to the SQL documentation (provided separately) for instructions on how to create your database and initialize the tables.

## Notes

- To test the interface on multiple devices, use `webpack-dev-server --host <your-ip-address>`.
- Run the full repo verification with `yarn test`.
- See the MySQL and PHP documentation for advanced configuration and security practices.

## Contributors

- Sebastian Muszytowski (https://github.com/muzy)
- Leonard Techel (https://github.com/barnslig)
- https://github.com/marudor
- Chris Veigl (https://github.com/ChrisVeigl)
- Overflo (https://github.com/overflo23)
- Chris Hager (https://github.com/metachris)
- Flo Lauber (https://github.com/sushimako)
