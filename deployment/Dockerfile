FROM node:22-alpine
EXPOSE 8080

# Use the built-in 'node' user instead of root
USER 1000

# Copy the app files
RUN mkdir -p /home/node/app
COPY .next/standalone /home/node/app/

# Enable signal handling in Next.js so the SQLite database can be closed
# properly
ENV NEXT_MANUAL_SIG_HANDLE="true"
ENV NODE_ENV="production"
ENV PORT=8080

# Start the app
WORKDIR /home/node/app
CMD ["server.js"]
