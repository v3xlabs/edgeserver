package services

import (
	"encoding/json"
	"fmt"
	"github.com/v3xlabs/edgeserver/apps/router/db"
	"github.com/v3xlabs/edgeserver/apps/router/models"
	"github.com/v3xlabs/edgeserver/apps/router/services/cache"
	"log"
	"regexp"
	"sync"
)

type GenericRule struct {
	Pattern string
}

type Condition struct {
	Type  string
	Key   string
	Value string
}

type HeaderRule struct {
	GenericRule
	Conditions []Condition
	Headers    map[string]string
}

type RewriteRule struct {
	GenericRule
	Conditions  []Condition
	Destination string
}

type RedirectRule struct {
	GenericRule
	Conditions  []Condition
	Status      int
	Destination string
}

// TODO: Implement Conditions

func getRedirectRules(deployId int64) (*[]RedirectRule, error) {
	return cache.UseCache(
		fmt.Sprintf("redirect_%d", deployId),
		[]cache.ResolverSetter[[]RedirectRule]{
			cache.UseLocalCache[[]RedirectRule](),
			cache.UseRedisCache[[]RedirectRule](),
			cache.ResolverSetter[[]RedirectRule]{
				Resolver: func(key string) (*[]RedirectRule, error) {
					session := db.Get()
					data := models.DeploymentConfigsStruct{
						DeployId: deployId,
					}

					q := session.Query(models.DeploymentConfigs.Get("redirects")).BindStruct(data)
					err := q.GetRelease(&data)
					log.Printf("getRedirectRulesDB: %v", data)

					result := make([]RedirectRule, 0)

					if err = json.Unmarshal([]byte(data.Redirects), &result); err != nil {
						return nil, err
					}

					return &result, err
				},
			},
		},
	)
}

func MatchRedirects(redirects *[]RedirectRule, path string) *RedirectRule {
	if redirects == nil {
		return nil
	}

	for _, redirect := range *redirects {
		match, err := regexp.MatchString(redirect.Pattern, path)

		if err != nil {
			continue
		}

		if match {
			return &redirect
		}
	}

	return nil
}

func getHeaderRules(deployId int64) (*[]HeaderRule, error) {
	return cache.UseCache(
		fmt.Sprintf("header__%d", deployId),
		[]cache.ResolverSetter[[]HeaderRule]{
			cache.UseLocalCache[[]HeaderRule](),
			cache.UseRedisCache[[]HeaderRule](),
			{
				Resolver: func(key string) (*[]HeaderRule, error) {
					session := db.Get()
					data := models.DeploymentConfigsStruct{
						DeployId: deployId,
					}

					q := session.Query(models.DeploymentConfigs.Get("headers")).BindStruct(data)
					err := q.GetRelease(&data)
					log.Printf("getHeaderRulesDB: %v", data)

					result := make([]HeaderRule, 0)

					if err = json.Unmarshal([]byte(data.Headers), &result); err != nil {
						return nil, err
					}

					return &result, err
				},
			},
		},
	)
}

func MatchHeaders(headers *[]HeaderRule, path string) *HeaderRule {
	if headers == nil {
		return nil
	}

	for _, header := range *headers {
		match, err := regexp.MatchString(header.Pattern, path)

		if err != nil {
			continue
		}

		if match {
			return &header
		}
	}

	return nil
}

func getRewriteRules(deployId int64) (*[]RewriteRule, error) {
	return cache.UseCache(
		fmt.Sprintf("rewrite_%d", deployId),
		[]cache.ResolverSetter[[]RewriteRule]{
			cache.UseLocalCache[[]RewriteRule](),
			cache.UseRedisCache[[]RewriteRule](),
			{
				Resolver: func(key string) (*[]RewriteRule, error) {
					session := db.Get()
					data := models.DeploymentConfigsStruct{
						DeployId: deployId,
					}

					q := session.Query(models.DeploymentConfigs.Get("rewrites")).BindStruct(data)
					err := q.GetRelease(&data)
					log.Printf("getRewriteRulesDB: %v", data)

					result := make([]RewriteRule, 0)

					if err = json.Unmarshal([]byte(data.Rewrites), &result); err != nil {
						return nil, err
					}

					return &result, err
				},
			},
		},
	)
}

func MatchRewrites(rewrites *[]RewriteRule, path string) *RewriteRule {
	if rewrites == nil {
		return nil
	}

	for _, rewrite := range *rewrites {
		match, err := regexp.MatchString(rewrite.Pattern, path)

		if err != nil {
			continue
		}

		if match {
			return &rewrite
		}
	}

	return nil
}

func GetHrrRules(deployID int64) (*[]HeaderRule, *[]RedirectRule, *[]RewriteRule) {
	var headerRules *[]HeaderRule
	var redirectRules *[]RedirectRule
	var rewriteRules *[]RewriteRule

	wg := sync.WaitGroup{}
	wg.Add(3)

	//	Header Rules
	//	TODO - implement
	go func() {
		defer wg.Done()

		rules, err := getHeaderRules(deployID)
		if err != nil {
			log.Printf("GetHeaderRulesErr: %v", err)
		}
		headerRules = rules
	}()

	//	Redirect Rules
	go func() {
		defer wg.Done()

		rules, err := getRedirectRules(deployID)
		if err != nil {
			log.Printf("GetRedirectRulesErr: %v", err)
		}
		redirectRules = rules
	}()

	//	Rewrite Rules
	//	TODO - implement
	go func() {
		defer wg.Done()

		rules, err := getRewriteRules(deployID)
		if err != nil {
			log.Printf("GetRewriteRulesErr: %v", err)
		}
		rewriteRules = rules
	}()

	wg.Wait()

	return headerRules, redirectRules, rewriteRules
}
