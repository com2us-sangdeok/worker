
echo "########################################"
echo "\t image pull(nexus docker Repositiry)"
echo "########################################"

IMAGE_NAME="blockchain-platform-pkg"
NEXUS_URL="nexus.withhive.com:18081"
docker login ${NEXUS_URL}
sleep 1

#defult latest
docker pull ${NEXUS_URL}/${IMAGE_NAME}

docker tag ${NEXUS_URL}/${IMAGE_NAME}:latest ${IMAGE_NAME}:latest
docker rmi ${NEXUS_URL}/${IMAGE_NAME}:latest