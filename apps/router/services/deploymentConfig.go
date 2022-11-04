package services

import (
	"encoding/json"
	"fmt"
	"github.com/v3xlabs/edgeserver/apps/router/db"
	"github.com/v3xlabs/edgeserver/apps/router/models"
	"github.com/v3xlabs/edgeserver/apps/router/services/cache"
	"log"
)

type RoutingConfig struct {
	FileExtensions *bool
	TrailingSlash  string // always, never, auto
	DefaultRoute   string
}

const (
	DefaultTrailingSlash  = "always"
	DefaultDefaultRoute   = "/index.html"
	DefaultFileExtensions = true
)

func GetRoutingConfig(deployId int64) (*RoutingConfig, error) {
	routingConfig, err := cache.UseCache(
		fmt.Sprintf("config_%d", deployId),
		[]cache.ResolverSetter[RoutingConfig]{
			cache.UseLocalCache[RoutingConfig](),
			cache.UseRedisCache[RoutingConfig](),
			{
				Resolver: func(key string) (*RoutingConfig, error) {
					session := db.Get()
					data := models.DeploymentConfigsStruct{
						DeployId: deployId,
					}

					q := session.Query(models.DeploymentConfigs.Get("routing")).BindStruct(data)
					err := q.GetRelease(&data)
					log.Printf("getHeaderRulesDB: %v", data)

					result := RoutingConfig{}

					if err = json.Unmarshal([]byte(data.Routing), &result); err != nil {
						return nil, err
					}

					return &result, err
				},
			},
		},
	)

	// Set default values
	if routingConfig != nil {
		if routingConfig.TrailingSlash == "" {
			routingConfig.TrailingSlash = DefaultTrailingSlash
		} else if routingConfig.TrailingSlash != "always" && routingConfig.TrailingSlash != "never" && routingConfig.TrailingSlash != "auto" {
			routingConfig.TrailingSlash = DefaultTrailingSlash
		}

		if routingConfig.DefaultRoute == "" {
			routingConfig.DefaultRoute = DefaultDefaultRoute
		}

		if routingConfig.FileExtensions == nil {
			routingConfig.FileExtensions = new(bool)
			*routingConfig.FileExtensions = DefaultFileExtensions
		}
	}

	return routingConfig, err
}
