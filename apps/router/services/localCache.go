package services

import (
	"encoding/json"
	"github.com/allegro/bigcache"
	"log"
	"time"
)

var _localCache *bigcache.BigCache

func SetupLocalCache() error {
	config := bigcache.DefaultConfig(5 * time.Second)
	config.OnRemove = func(key string, entry []byte) {
		log.Println("------------------")
		log.Printf("LocalCache: Removed %s", key)
		log.Println("------------------")
	}
	config.OnRemoveWithReason = func(key string, entry []byte, reason bigcache.RemoveReason) {
		log.Println("------------------")
		log.Printf("LocalCache: Removed %s with reason %s", key, reason)
		log.Println("------------------")
	}
	config.CleanWindow = 10 * time.Second
	localCache, err := bigcache.NewBigCache(config)
	if err != nil {
		return err
	}

	_localCache = localCache
	return nil
}

func GetLocalCache() *bigcache.BigCache {
	return _localCache
}

func UseLocalCache[K any]() ResolverSetter[K] {
	return ResolverSetter[K]{
		Resolver: func(key string) (*K, error) {
			value, err := _localCache.Get(key)
			if err != nil {
				log.Printf("UseLocalCacheErr: %v", err)

				if err == bigcache.ErrEntryNotFound {
					return nil, nil
				}

				return nil, err
			}

			result := new(K)

			err = json.Unmarshal(value, result)
			if err != nil {
				log.Printf("UseLocalCacheUnmarshalErr: %v", err)
				return nil, err
			}

			log.Printf("UseLocalCache: %v", result)

			return result, nil
		},
		Setter: func(key string, value K) error {
			data, err := json.Marshal(value)
			if err != nil {
				return err
			}
			return _localCache.Set(key, data)
		},
	}
}
