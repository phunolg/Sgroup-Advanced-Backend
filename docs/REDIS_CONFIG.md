# Chạy Redis Container

Mở terminal và chạy lệnh sau để khởi động một container Redis:

`docker run -d --name sgroup-trello -p 6379:6379 redis`
Lệnh này sẽ tải về hình ảnh Redis mới nhất từ Docker Hub (nếu chưa có) và chạy nó trong một container có tên `sgroup-trello`, ánh xạ cổng 6379 của container với cổng 6379 trên máy chủ của bạn.

# Kiểm tra Redis Container

Để kiểm tra xem container Redis có đang chạy hay không, sử dụng lệnh:
`docker ps`
Nếu container đang chạy, bạn sẽ thấy nó trong danh sách các container hoạt động.

# Kết nối và sử dụng Redis

Cách 1: Sử dụng Redis CLI
Bạn có thể kết nối vào container Redis và sử dụng Redis CLI bằng lệnh:
`docker exec -it sgroup-trello redis-cli`

Cách 2: Dùng một công cụ GUI
Bạn cũng có thể sử dụng các công cụ GUI như RedisInsight hoặc Medis để kết nối và quản lý Redis dễ dàng hơn.
Chỉ cần nhập địa chỉ `localhost` và cổng `6379` để kết nối.
