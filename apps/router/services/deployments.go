package services

import (
	"fmt"
	"github.com/scylladb/gocqlx/v2/qb"
	"github.com/v3xlabs/edgeserver/apps/router/db"
	"github.com/v3xlabs/edgeserver/apps/router/models"
	"github.com/v3xlabs/edgeserver/apps/router/services/cache"
	"log"
)

//func GetDeploymentData(deployId int64) (models.DeploymentStruct, error) {
//	session := db.Get()
//	data := models.DeploymentStruct{}
//
//	q := session.Query("SELECT * FROM deployments WHERE deploy_id=?", []string{"deploy_id"}).BindMap(qb.M{"deploy_id": deployId})
//	err := q.GetRelease(&data)
//
//	return data, err
//}

func GetDeploymentData(deployId int64) (*models.DeploymentStruct, error) {
	return cache.UseCache(
		fmt.Sprintf("deployment_%d", deployId),
		[]cache.ResolverSetter[models.DeploymentStruct]{
			cache.UseLocalCache[models.DeploymentStruct](),
			cache.UseRedisCache[models.DeploymentStruct](),
			cache.ResolverSetter[models.DeploymentStruct]{
				Resolver: func(key string) (*models.DeploymentStruct, error) {
					session := db.Get()
					data := models.DeploymentStruct{}

					q := session.Query("SELECT * FROM deployments WHERE deploy_id=?", []string{"deploy_id"}).BindMap(qb.M{"deploy_id": deployId})
					err := q.GetRelease(&data)
					log.Printf("GetDeploymentDataDB: %v", data)

					return &data, err
				},
			},
		})
}
