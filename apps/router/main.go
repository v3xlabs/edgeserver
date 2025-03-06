package main

import (
	"embed"
	"github.com/v3xlabs/edgeserver/apps/router/db"
	"github.com/v3xlabs/edgeserver/apps/router/router"
	"github.com/v3xlabs/edgeserver/apps/router/services/cache"
	"github.com/v3xlabs/edgeserver/apps/router/storage"
	"log"
	"net/http"
)

//go:embed static/*
var staticFiles embed.FS

func main() {
	stopDB, err := db.Setup()
	if err != nil {
		log.Fatal(err)
	}
	defer stopDB.Close()

	signal := storage.NewSignalFS("http://127.0.0.1:8000")
	storage.Set(signal)

	cache.SetupLocalCache()
	err = cache.SetupRedisCache()
	if err != nil {
		log.Fatal(err)
	}

	router.StaticFiles = staticFiles

	http.HandleFunc("/", router.Router)

	http.ListenAndServe(":1234", nil)
}
