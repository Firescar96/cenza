docker build -t gcr.io/firescar96/cenza-nginx:current -f nginx/nginx-dockerfile nginx
docker push gcr.io/firescar96/cenza-nginx:current
kubectl get pods | grep cenza-nginx | awk '{print $1}' | xargs kubectl delete pod