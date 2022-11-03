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

	// ==================== Get Site Data ====================

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

	// ==================== Get HRR Rules ====================

	headerRules, redirectRules, rewriteRules := services.GetHrrRules(siteData.DeployId)

	// ==================== Handle Redirects ====================

	matchedRedirectRule := services.MatchRedirects(redirectRules, pathUrl)

	if matchedRedirectRule != nil {
		redirectCode := matchedRedirectRule.Status
		if redirectCode == 0 {
			redirectCode = 301
		}

		log.Println("Redirecting")
		http.Redirect(w, r, matchedRedirectRule.Destination, redirectCode)
		return
	}

	// ==================== Handle Headers ====================

	matchedHeaderRule := services.MatchHeaders(headerRules, pathUrl)

	if matchedHeaderRule != nil {
		for key, value := range matchedHeaderRule.Headers {
			w.Header().Set(key, value)
		}
	}

	// ==================== Handle Rewrites ====================

	matchedRewriteRule := services.MatchRewrites(rewriteRules, pathUrl)

	if matchedRewriteRule != nil {
		pathUrl = matchedRewriteRule.Destination
	}

	// ==================== Get Deployment Data ====================

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

	// ================== Resolve route ==================
	storageProvider := storage.Get()

	fileData, err := services.ResolveRoute(storageProvider, deployment.Sid, pathUrl, "/index.html")
	if err != nil {
		// TODO: Better error handling
		log.Println("Filedata error:", err)
		sendErrorPage(w, r, 502)
		return
	}
	defer fileData.Close()

	// ================== Send response ==================

	w.Header().Set("Content-Type", fileData.ContentType)
	w.Header().Set("X-Server", "edgeserver.io")
	_, err = io.Copy(w, fileData.Data)

	return
}
