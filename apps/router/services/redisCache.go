package services

import (
	"context"
	"encoding/json"
	"github.com/go-redis/redis/v9"
	"log"
	"time"
)

var _redisContext = context.Background()
var _redisClient *redis.Client

func SetupRedisCache() error {
	_redisClient = redis.NewClient(&redis.Options{
		Addr:     "localhost:6379",
		Password: "",
		DB:       0,
	})

	_, err := _redisClient.Ping(_redisContext).Result()
	if err != nil {
		return err
	}

	return nil
}

func GetRedisClient() (context.Context, *redis.Client) {
	return _redisContext, _redisClient
}

func UseRedisCache[K any]() ResolverSetter[K] {
	return ResolverSetter[K]{
		Resolver: func(key string) (*K, error) {
			value, err := _redisClient.Get(_redisContext, key).Result()
			if err != nil {
				log.Printf("UseRedisCacheErr: %v", err)
				if err == redis.Nil {
					return nil, nil
				}

				return nil, err
			}

			result := new(K)
			err = json.Unmarshal([]byte(value), result)
			if err != nil {
				log.Printf("UseRedisCacheUnmarshalErr: %v", err)
				return nil, err
			}

			log.Printf("UseRedisCache: %v", result)

			return result, nil
		},
		Setter: func(key string, value K) error {
			log.Printf("UseRedisCacheSet: %v", value)
			valueJson, err := json.Marshal(value)
			if err != nil {
				log.Printf("UseRedisCacheMarshalErr: %v", err)
				return err
			}

			err = _redisClient.Set(_redisContext, key, valueJson, 600*time.Second).Err()
			if err != nil {
				log.Printf("UseRedisCacheSetErr: %v", err)
				return err
			}

			return nil
		},
	}
}
