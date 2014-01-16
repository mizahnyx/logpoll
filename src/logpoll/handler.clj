(ns logpoll.handler
  (:use compojure.core)
  (:require [clojure.java.io :as io]
            [compojure.handler :as handler]
            [compojure.route :as route]))

(import '[java.io RandomAccessFile])
(import '[java.io File])
(use '[clojure.string :only (join)])

(defn parse-int [s]
  (Integer. (re-find  #"\d+" s )))

(def config
  (read-string (str \( (slurp (io/resource "config.clj")) \) )))

(defroutes app-routes
  (GET "/" [] (io/resource "public/index.html"))
  (GET "/list" []
       {:headers {"Content-Type" "text/plain"}
        :body (join "|" config)})
  (GET "/full/:i" [i]
       {:headers {"Content-Type" "text/plain"
                  "Content-Disposition"
                  (str "attachment; filename=\"" 
                       (nth config (parse-int i)) "\"")}
        :body (slurp (nth config (parse-int i)))})
  (GET "/incremental/:i/:n" [i n]
       {:headers {"Content-Type" "text/plain"}
        :body (let [file-name (nth config (parse-int i))
                    file-size (.length (File. file-name))
                    start (parse-int n)]
                (with-open [f (RandomAccessFile. file-name "r")]
                  (let [_ (.seek f start)
                        chunk-length (- file-size start)
                        bytes (byte-array chunk-length)
                        _ (.read f bytes)]
                    (apply str (map char bytes)))))})
  (route/resources "/")
  (route/not-found "Not Found"))

(def app
  (handler/site app-routes))
