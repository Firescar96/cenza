docker build -t gcr.io/firescar96/cenza-ome:current -f OvenMediaEngine/ome-dockerfile OvenMediaEngine
docker push gcr.io/firescar96/cenza-ome:current
kubectl get pods | grep cenza-ome | awk '{print $1}' | xargs kubectl delete pod --force --grace-period=0