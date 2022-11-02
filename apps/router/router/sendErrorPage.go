package router

import (
	"embed"
	"fmt"
	"log"
	"net/http"
)

//go:embed static/*
var staticFiles embed.FS

func sendErrorPage(w http.ResponseWriter, r *http.Request, code int) {
	fileBytes, err := staticFiles.ReadFile(fmt.Sprintf("static/%d.html", code))
	if err != nil {
		log.Panicln(err)
	}

	w.WriteHeader(code)
	_, err = w.Write(fileBytes)
	if err != nil {
		log.Panicln(err)
	}
	return
}
