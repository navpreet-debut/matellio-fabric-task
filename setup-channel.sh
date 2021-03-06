#!/bin/bash
. set-env.sh

export VERBOSE=false
export MAX_RETRY=5
export CLI_DELAY=3
export CHANNEL_NAME="mychannel"
export DELAY=3

# import utils
. scripts/envVar.sh

if [ ! -d "channel-artifacts" ]; then
	mkdir channel-artifacts
fi

createChannelTx() {
	set -x
	configtxgen -profile MyChannel -outputCreateChannelTx ./channel-artifacts/${CHANNEL_NAME}.tx -channelID $CHANNEL_NAME
	res=$?
	set +x
	if [ $res -ne 0 ]; then
		echo "Failed to generate channel configuration transaction..."
		exit 1
	fi
	echo

}

createAncorPeerTx() {
	for orgmsp in Org1; do

	echo "#######    Generating anchor peer update transaction for ${orgmsp}  ##########"
	set -x
	configtxgen -profile MyChannel -outputAnchorPeersUpdate ./channel-artifacts/${orgmsp}MSPanchors.tx -channelID $CHANNEL_NAME -asOrg ${orgmsp}
	res=$?
	set +x
	if [ $res -ne 0 ]; then
		echo "Failed to generate anchor peer update transaction for ${orgmsp}..."
		exit 1
	fi
	echo
	done
}
echo $FABRIC_CFG_PATH
createChannel() {
	echo $FABRIC_CFG_PATH
	echo  channel name is $CHANNEL_NAME 
	setGlobals 1
	# Poll in case the raft leader is not set yet
	local rc=1
	local COUNTER=1
	while [ $rc -ne 0 -a $COUNTER -lt $MAX_RETRY ] ; do
		sleep $DELAY
		set -x
		peer channel create -o localhost:7050 -c $CHANNEL_NAME --ordererTLSHostnameOverride orderer.matelliofabric.com -f ./channel-artifacts/${CHANNEL_NAME}.tx --outputBlock ./channel-artifacts/${CHANNEL_NAME}.block --tls --cafile $ORDERER_CA >&log.txt
		res=$?
		set +x
		let rc=$res
		COUNTER=$(expr $COUNTER + 1)
	done
	cat log.txt
	verifyResult $res "Channel creation failed"
	echo
	echo "===================== Channel '$CHANNEL_NAME' created ===================== "
	echo
}

# queryCommitted ORG
joinChannel() {
  ORG=$1
  setGlobals $ORG
	local rc=1
	local COUNTER=1
	## Sometimes Join takes time, hence retry
	while [ $rc -ne 0 -a $COUNTER -lt $MAX_RETRY ] ; do
    sleep $DELAY
    set -x
    peer channel join -b ./channel-artifacts/$CHANNEL_NAME.block >&log.txt
    res=$?
    set +x
		let rc=$res
		COUNTER=$(expr $COUNTER + 1)
	done
	cat log.txt
	echo
	verifyResult $res "After $MAX_RETRY attempts, peer0.org${ORG} has failed to join channel '$CHANNEL_NAME' "
}

updateAnchorPeers() {
  ORG=$1
  setGlobals $ORG
	local rc=1
	local COUNTER=1
	## Sometimes Join takes time, hence retry
	while [ $rc -ne 0 -a $COUNTER -lt $MAX_RETRY ] ; do
    sleep $DELAY
    set -x
		peer channel update -o localhost:7050 --ordererTLSHostnameOverride orderer.matelliofabric.com -c $CHANNEL_NAME -f ./channel-artifacts/${CORE_PEER_LOCALMSPID}anchors.tx --tls --cafile $ORDERER_CA >&log.txt
    res=$?
    set +x
		let rc=$res
		COUNTER=$(expr $COUNTER + 1)
	done
	cat log.txt
  verifyResult $res "Anchor peer update failed"
  echo "===================== Anchor peers updated for org '$CORE_PEER_LOCALMSPID' on channel '$CHANNEL_NAME' ===================== "
  sleep $DELAY
  echo
}

verifyResult() {
  if [ $1 -ne 0 ]; then
    echo "!!!!!!!!!!!!!!! "$2" !!!!!!!!!!!!!!!!"
    echo
    exit 1
  fi
}

FABRIC_CFG_PATH=$PWD/configtx

# Create channeltx
echo "### Generating channel create transaction '${CHANNEL_NAME}.tx' ###"
createChannelTx

# Create anchorpeertx
echo "### Generating anchor peer update transactions ###"
createAncorPeerTx

FABRIC_CFG_PATH=$HOME/fabric-samples/config/

# Create channel
echo "Creating channel "$CHANNEL_NAME
createChannel

## Join all the peers to the channel
echo "Join Org1 peers to the channel..."
joinChannel 1

## Set the anchor peers for each org in the channel
echo "Updating anchor peers for org1..."
updateAnchorPeers 1

echo
echo "========= Channel successfully joined =========== "
echo

exit 0
