Then run the build commands one by one, replacing yourusername with your actual Docker Hub username:

docker build -t yourusername/artist_service:v1 ./artist_service
docker build -t yourusername/event_service:v1 ./event_service
docker build -t yourusername/payment_service:v1 ./payment_service
docker build -t yourusername/ticket_service:v1 ./ticket_service
docker build -t yourusername/user_service:v1 ./user_service
docker build -t yourusername/venue_service:v1 ./venue_service


then 

docker push yourusername/artist_service:v1
docker push yourusername/event_service:v1
docker push yourusername/payment_service:v1
docker push yourusername/ticket_service:v1
docker push yourusername/user_service:v1
docker push yourusername/venue_service:v1