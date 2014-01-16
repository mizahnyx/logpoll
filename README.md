# logpoll

`logpoll` is a web application to watch continuously the growth of a log file.

## Prerequisites

You will need [Leiningen][1] 1.7.0 or above installed.

[1]: https://github.com/technomancy/leiningen

## Running

To start a web server for the application, run:

    lein ring server

To build a WAR file with the application, run:

    lein ring war

The file `resources/config.clj` is just a list of the full paths of the files to watch, enclosed in double quotes.

## License

Copyright © 2014 Sam Jenkins.
