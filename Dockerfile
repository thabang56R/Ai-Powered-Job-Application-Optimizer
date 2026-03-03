# Build stage
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src

COPY . .

RUN dotnet restore HireLens.Api/HireLens.Api.csproj
RUN dotnet publish HireLens.Api/HireLens.Api.csproj -c Release -o /app/publish

# Runtime stage
FROM mcr.microsoft.com/dotnet/aspnet:8.0
WORKDIR /app

COPY --from=build /app/publish .

# Render provides PORT env variable
ENV ASPNETCORE_URLS=http://+:$PORT

EXPOSE 8080

ENTRYPOINT ["dotnet", "HireLens.Api.dll"]