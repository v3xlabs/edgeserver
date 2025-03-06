package cache

type Setter[K any] func(key string, value K) error
type Resolver[K any] func(key string) (*K, error)

type ResolverSetter[K any] struct {
	Setter[K]
	Resolver[K]
}

func UseCache[K any](key string, functions []ResolverSetter[K]) (*K, error) {
	setters := make([]Setter[K], 0)
	var result K

	for _, function := range functions {
		value, err := function.Resolver(key)
		if err != nil {
			return nil, err
		}

		//	check if value is empty
		if value != nil {
			result = *value
			for _, setter := range setters {
				err := setter(key, result)
				if err != nil {
					return nil, err
				}
			}

			break
		}

		if function.Setter != nil {
			setters = append(setters, function.Setter)
		}
	}

	return &result, nil
}

//
