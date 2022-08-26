echo "########################################"
echo "\t make pkg file"
echo "########################################"
npm run build
npm run build:pkg

echo "########################################"
echo "\t create docker image"
echo "########################################"

IMAGE_NAME="blockchain-platform-pkg"
IMAGE_VERSION=$(cat package.json |
  grep version |
  head -1 |
  awk -F: '{ print $2 }' |
  sed 's/[",]//g' |
  tr -d '[[:space:]]')

docker build -t ${IMAGE_NAME}:${IMAGE_VERSION} .
docker tag ${IMAGE_NAME}:${IMAGE_VERSION} ${IMAGE_NAME}:latest

#sleep 1
#echo "########################################"
#echo "\t image push(nexus docker Repositiry)"
#echo "########################################"
#
#NEXUS_URL="nexus.withhive.com:18081"
#docker login ${NEXUS_URL}
#sleep 1
#
#docker tag ${IMAGE_NAME}:${IMAGE_VERSION} ${NEXUS_URL}/${IMAGE_NAME}:${IMAGE_VERSION}
#docker tag ${IMAGE_NAME}:latest ${NEXUS_URL}/${IMAGE_NAME}:latest
#
#docker push ${NEXUS_URL}/${IMAGE_NAME}:${IMAGE_TAGIMAGE_VERSION}
#docker push ${NEXUS_URL}/${IMAGE_NAME}:latest
#
#docker rmi ${NEXUS_URL}/${IMAGE_NAME}:${IMAGE_VERSION}
#docker rmi ${NEXUS_URL}/${IMAGE_NAME}:latest
