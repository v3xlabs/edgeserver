package services

import (
	"fmt"
	"github.com/v3xlabs/edgeserver/apps/router/db"
	"github.com/v3xlabs/edgeserver/apps/router/models"
	"github.com/v3xlabs/edgeserver/apps/router/services/cache"
	"log"
)

func GetSiteData(baseUrl string) (*models.DltStruct, error) {
	return cache.UseCache(
		fmt.Sprintf("dlt_%s", baseUrl),
		[]cache.ResolverSetter[models.DltStruct]{
			cache.UseLocalCache[models.DltStruct](),
			cache.UseRedisCache[models.DltStruct](),
			cache.ResolverSetter[models.DltStruct]{
				Resolver: func(key string) (*models.DltStruct, error) {
					session := db.Get()
					data := models.DltStruct{
						BaseUrl: baseUrl,
					}

					q := session.Query(models.Dlt.Get()).BindStruct(data)
					err := q.GetRelease(&data)
					log.Printf("GetSiteDataDB: %v", data)

					return &data, err
				},
			},
		})
}
