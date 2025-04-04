# webedit-react  Blinkenstar WebInterface

[![Build Status](https://travis-ci.org/blinkenstar/webedit-react.svg?branch=master)](https://travis-ci.org/blinkenstar/webedit-react)

[blinkenstar.sternenlabor.de](http://blinkenstar.sternenlabor.de/)


## Quickstart

#### System Setup

* Install NodeJS v8: https://nodejs.org/en/download/
* Install Yarn: https://yarnpkg.com

#### Getting started with the code

Clone the Git repository, and change into the project directory.

    # Install dependencies and build the project
    yarn
    yarn build

    # Run development server
    yarn dev

Now you can access the web interface via http://127.0.0.1:8080


#### Deployment

The [production release](https://blinkenstar.sternenlabor.de) is hosted at Firebase. To deploy a new version, execute the following commands on your local machine:
```
  $ FIREBASE_PROJECT_ID='blinkenstar' FIREBASE_API_KEY='<api key>' FIREBASE_AUTH_DOMAIN='blinkenstar.sternenlabor.de' yarn build-firebase
  $ firebase login
  $ firebase deploy -m "some explanation what this release changes"
```


## Notes

* if you want to test the interface from other devices use `webpack-dev-server --host <ip-adress-of-your-computer>`
* See [github.com/ChrisVeigl/blinkenstar-firmware/docs](https://github.com/ChrisVeigl/blinkenstar-firmware/tree/master/docs) for more infos about the v2 firmware


## Contributors

* Sebastian Muszytowski (https://github.com/muzy)
* Leonard Techel (https://github.com/barnslig)
* https://github.com/marudor
* Chris Veigl (https://github.com/ChrisVeigl)
* Overflo (https://github.com/overflo23)
* Chris Hager (https://github.com/metachris)
* Flo Lauber (https://github.com/sushimako)
