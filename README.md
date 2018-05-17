# auto-home

Home automation for my home.

## feature

### Trash day

Say next day's trash in my home.

*How to run*

```
yarn start
```

for debug (not say by Google Home)

```
IGNORE_NOTIFY=1 yarn start
```

## How to install to Raspberry pi

### Setup yarn.

```
curl -sL https://deb.nodesource.com/setup_8.x | sudo -E bash -
curl -sS https://dl.yarnpkg.com/debian/pubkey.gpg | sudo apt-key add -
echo "deb https://dl.yarnpkg.com/debian/ stable main" | sudo tee /etc/apt/sources.list.d/yarn.list
sudo apt-get update && sudo apt-get install -y nodejs yarn
sudo apt-get install -y build-essential
sudo apt-get install -y gcc-4.8 g++-4.8
sudo apt-get install -y git-core libnss-mdns libavahi-compat-libdnssd-dev
```

### Place app.

```
sudo mkdir /app
cd /app
sudo mkdir auto-home
sudo chown pi:pi auto-home/
git clone https://github.com/noboru-i/auto-home.git
cd auto-home
yarn install
```

### Patch `google-home-notifier`.

https://github.com/noelportugal/google-home-notifier/blob/302f149af251951fbd67fb0d7f0122c8118f0d8f/README.md#after-npm-install

add `{families:[4]}`.

### Setup cron.

```
crontab -e
```

add to below for execute 20:58JST every day.

```
58 11 * * * cd /app/auto-home; yarn start
```
