FROM nginx:alpine
# ก๊อปปี้ไฟล์คอนฟิกที่เราเพิ่งสร้างไปใส่ในระบบ
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY index.html /usr/share/nginx/html/
COPY app.js /usr/share/nginx/html/
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]