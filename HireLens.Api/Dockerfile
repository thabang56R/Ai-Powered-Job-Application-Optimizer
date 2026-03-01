# Build
FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
WORKDIR /src
COPY ./HireLens.Api/HireLens.Api.csproj ./HireLens.Api/
RUN dotnet restore ./HireLens.Api/HireLens.Api.csproj
COPY . .
RUN dotnet publish ./HireLens.Api/HireLens.Api.csproj -c Release -o /app/publish

# Run
FROM mcr.microsoft.com/dotnet/aspnet:10.0
WORKDIR /app
ENV ASPNETCORE_URLS=http://+:8080
EXPOSE 8080
COPY --from=build /app/publish .
ENTRYPOINT ["dotnet", "HireLens.Api.dll"]