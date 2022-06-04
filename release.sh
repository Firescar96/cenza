yarn run build
docker build -t gcr.io/firescar96/cenza-website:current -f website-dockerfile .
docker push gcr.io/firescar96/cenza-website:current
kubectl get pods | grep cenza-website | awk '{print $1}' | xargs kubectl delete pod