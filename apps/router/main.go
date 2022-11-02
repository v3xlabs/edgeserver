package main

import (
	"github.com/v3xlabs/edgeserver/apps/router/db"
	"github.com/v3xlabs/edgeserver/apps/router/router"
	"github.com/v3xlabs/edgeserver/apps/router/storage"
	"log"
	"net/http"
)

func main() {
	stopDB, err := db.Setup()
	if err != nil {
		log.Fatal(err)
	}
	defer stopDB.Close()

	signal := storage.NewSignalFS("http://127.0.0.1:8000")
	storage.Set(signal)

	http.HandleFunc("/", router.Router)

	http.ListenAndServe(":1234", nil)
}
