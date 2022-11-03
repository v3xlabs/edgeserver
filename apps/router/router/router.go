package router

import (
	"fmt"
	"github.com/gocql/gocql"
	"github.com/v3xlabs/edgeserver/apps/router/services"
	"github.com/v3xlabs/edgeserver/apps/router/storage"
	"io"
	"log"
	"net/http"
)

func Router(w http.ResponseWriter, r *http.Request) {
	log.Println("======================================")

	baseUrl := r.Host
	pathUrl := r.URL.EscapedPath()

	//fmt.Println(baseUrl, pathUrl)
	log.Printf("baseUrl: %s, pathUrl: %s", baseUrl, pathUrl)

	siteData, err := services.GetSiteData(baseUrl)

	if err == gocql.ErrNotFound {
		log.Println("Site not found")
		sendErrorPage(w, r, 404)
		return
	} else if err != nil {
		sendErrorPage(w, r, 503)
		fmt.Println(err)
		return
	}

	deployment, err := services.GetDeploymentData(siteData.DeployId)

	if err == gocql.ErrNotFound {
		log.Println("Deployment not found")
		sendErrorPage(w, r, 404)
		return
	} else if err != nil {
		sendErrorPage(w, r, 502)
		fmt.Println(err)
		return
	}

	storageProvider := storage.Get()

	fileData, err := services.ResolveRoute(storageProvider, deployment.Sid, pathUrl, "/index.html")
	if err != nil {
		// TODO: Better error handling
		log.Println("Filedata error:", err)
		sendErrorPage(w, r, 502)
		return
	}
	defer fileData.Close()

	w.Header().Set("Content-Type", fileData.ContentType)
	w.Header().Set("X-Server", "edgeserver.io")
	_, err = io.Copy(w, fileData.Data)

	return
}
