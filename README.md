# start.ffggrz

## Add a service

The list of all services is located at `config.json`. You can use this file to sort the services and add new ones.

### Syntax

```json
{
	"name": "Example",
	"url": "http://example.com/",
	"comment": "Example-Link",
	"symbol": "map-pin",
	"public": true
}
```

- `name`: *(string)* displayname of the service
- `url`: *(string)* url of the service
- `comment`: *(string)* comment
- `symbol`: *(string)* symbol (pick from [here](https://fortawesome.github.io/Font-Awesome/icons/), the `fa-` will be added automatically)
- `public`: *(bool)* whether the link is public or from the internal network

## Deploy

```sh
cd /var/www/
git clone https://github.com/ffggrz/start-ffggrz.git
```

## License

https://creativecommons.org/licenses/by-sa/4.0/

