docker rm -f $(docker ps -aq)

docker network prune 
docker volume prune
docker rmi -f $(docker images | awk '($1 ~ /dev-peer.*.nlts.*/) {print $3}')
rm -rf ../sdk/wallet/
