## [2.2.1](https://github.com/Rocketmakers/api-swr/compare/v2.2.0...v2.2.1) (2025-03-28)


### Bug Fixes

* - Cache manager export added ([0105f84](https://github.com/Rocketmakers/api-swr/commit/0105f848ff2ad6d2199ed51ac1c1b50bcb52d712))

# [2.2.0](https://github.com/Rocketmakers/api-swr/compare/v2.1.1...v2.2.0) (2025-03-27)


### Features

* - UseCacheManager toolkit added ([7c14054](https://github.com/Rocketmakers/api-swr/commit/7c1405475fcc9eb9aa2955247ea212248eee8fa7))

## [2.1.1](https://github.com/Rocketmakers/api-swr/compare/v2.1.0...v2.1.1) (2025-01-28)


### Bug Fixes

* - Fixes cache key typing bug on TSOA clients with all optional params ([d1f8a19](https://github.com/Rocketmakers/api-swr/commit/d1f8a19fa3c2ae6be6127fb5e1565971bb9a1b84))

# [2.1.0](https://github.com/Rocketmakers/api-swr/compare/v2.0.1...v2.1.0) (2025-01-08)


### Features

* - Allows mocking to be switched on per hook rather than only globally ([b3f0ff9](https://github.com/Rocketmakers/api-swr/commit/b3f0ff9c493ad584870ee864bcfb487fa33bcd0a))

## [2.0.1](https://github.com/Rocketmakers/api-swr/compare/v2.0.0...v2.0.1) (2024-12-12)


### Bug Fixes

* - Added missing type exports ([3c1fdb2](https://github.com/Rocketmakers/api-swr/commit/3c1fdb28f998db5013d54b52ed2e54f984649b16))

# [2.0.0](https://github.com/Rocketmakers/api-swr/compare/v1.5.3...v2.0.0) (2024-11-06)


### Features

* - awaited fetches now return the whole axios response ([fe8a7f1](https://github.com/Rocketmakers/api-swr/commit/fe8a7f1c324ad036b6abaa14a155d14fabc04abc))


### BREAKING CHANGES

* This changes the response from all awaited fetches

## [1.5.3](https://github.com/Rocketmakers/api-swr/compare/v1.5.2...v1.5.3) (2024-09-19)


### Bug Fixes

* - Adds SSR use client directives for swr driven hooks ([2c3742b](https://github.com/Rocketmakers/api-swr/commit/2c3742b657621902f07365423576d6186760219f))

## [1.5.2](https://github.com/Rocketmakers/api-swr/compare/v1.5.1...v1.5.2) (2024-09-18)


### Bug Fixes

* - Removes uneccessary content memo on fetch config so it can contain functions ([98a8ada](https://github.com/Rocketmakers/api-swr/commit/98a8ada9b20825b0493e711a60abcbcd2ffd6f16))

## [1.5.1](https://github.com/Rocketmakers/api-swr/compare/v1.5.0...v1.5.1) (2024-09-17)


### Bug Fixes

* - response types being correctly propogated through hooks ([7f92096](https://github.com/Rocketmakers/api-swr/commit/7f9209678f745b47eace99f04bf399f8f30fbd43))

# [1.5.0](https://github.com/Rocketmakers/api-swr/compare/v1.4.1...v1.5.0) (2024-09-17)


### Features

* added generic controller factory for use with non-OpenAPI stacks ([9025ab0](https://github.com/Rocketmakers/api-swr/commit/9025ab018b1195c3a16296848a5beceac61f1f54))

## [1.4.1](https://github.com/Rocketmakers/api-swr/compare/v1.4.0...v1.4.1) (2024-06-19)


### Bug Fixes

* correct function name in readme ([72a4e96](https://github.com/Rocketmakers/api-swr/commit/72a4e96132babd759dee27e36d6955a45b29cd2c))

# [1.4.0](https://github.com/Rocketmakers/api-swr/compare/v1.3.4...v1.4.0) (2024-06-14)


### Features

* adds a new waitFor prop to useQuery ([1513082](https://github.com/Rocketmakers/api-swr/commit/151308273043887d13bbff83f84ffa608dd21f7e))

## [1.3.4](https://github.com/Rocketmakers/api-swr/compare/v1.3.3...v1.3.4) (2024-05-29)


### Bug Fixes

* - Fixed bug causing axios response not to be detected correctly ([b127e14](https://github.com/Rocketmakers/api-swr/commit/b127e14da3240a275ea559117d2c4a6705210c0c))

## [1.3.3](https://github.com/Rocketmakers/api-swr/compare/v1.3.2...v1.3.3) (2024-05-20)


### Bug Fixes

* improves axios response check to be more secure ([94af591](https://github.com/Rocketmakers/api-swr/commit/94af5912ca99a471a405c9cc55e67b79ea7b44ff))

## [1.3.2](https://github.com/Rocketmakers/api-swr/compare/v1.3.1...v1.3.2) (2024-05-15)


### Bug Fixes

* - Added useClient to provider for SSR support ([fb4a5d8](https://github.com/Rocketmakers/api-swr/commit/fb4a5d8e9f467025cc7f001653ed5068ea89a244))

## [1.3.1](https://github.com/Rocketmakers/api-swr/compare/v1.3.0...v1.3.1) (2024-03-15)


### Bug Fixes

* - Fixed OpenAPI config typings ([55e1d68](https://github.com/Rocketmakers/api-swr/commit/55e1d687b309a99901533dc573eed0b725637f40))

# [1.3.0](https://github.com/Rocketmakers/api-swr/compare/v1.2.0...v1.3.0) (2024-03-05)


### Features

* added more advanced cache key value getters that accept arrays ([1cdb776](https://github.com/Rocketmakers/api-swr/commit/1cdb7762ab7166d0c1066972e704be9b497ea83f))

# [1.2.0](https://github.com/Rocketmakers/api-swr/compare/v1.1.0...v1.2.0) (2024-01-30)


### Features

* fetch wrappers added ([fc15ef9](https://github.com/Rocketmakers/api-swr/commit/fc15ef99be4b01a8e9986532fdeedc3c75c6e5c1))
