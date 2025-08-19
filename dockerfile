# Pakai base image resmi Bun
FROM oven/bun:1

# Set folder kerja
WORKDIR /app

# Copy semua file ke dalam container
COPY . .

# Install dependencies
RUN bun install

# Expose port
EXPOSE 3000

# Command start app
CMD ["bun", "run", "start"]