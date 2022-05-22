. set-env.sh
export CHANNEL_NAME="mychannel"

echo "##### Generating Certificates #####"
# cryptogen generate --config=./organizations/cryptogen/crypto-config-org1.yaml --output="organizations"
# cryptogen generate --config=./organizations/cryptogen/crypto-config-orderer.yaml --output="organizations"

# echo
echo "#########  Generating Orderer Genesis block ##############"
# configtxgen -profile OrdererGenesis -channelID system-channel -outputBlock ./system-genesis-block/genesis.block

# docker-compose -f ./docker/docker-compose-cli.yaml up -d
