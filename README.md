# start.ffggrz

## Add a service

The list of all services is located at `services.json`. You can use this file to sort the services and add new ones.

### Syntax

```json
{
    "name": "Example",
    "url": {
        "external": "http://example.com/"
    },
    "comment": "Example-Link",
    "symbol": "map-pin",
    "public": true
}
```

- `name`: *(string)* displayname of the service
- `url`: *(object)* urls of the service
  - `internal`: *(string)* internal service url
  - `external`: *(string)* external service url
- `comment`: *(string)* comment
- `symbol`: *(string)* symbol (pick from [here](https://fortawesome.github.io/Font-Awesome/icons/), the `fa-` will be added automatically)
- `public`: *(bool)* whether the link is public or from the internal network

## Change configuration

The other configurations are located at `config.json`.

## Deploy

```sh
cd /var/www/
git clone https://github.com/ffggrz/start-ffggrz.git start.ffggrz.de
```

## Update

The content is updated automatically from the server every 30 minutes.

## License

https://creativecommons.org/licenses/by-sa/4.0/

