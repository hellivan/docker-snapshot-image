# docker-snapshot-image

Command line utiltiy that allows to easily create docker snapshot-images from an exising node.js project. The resulting images by default will be tagged as follows: `{project-name}:{project-version}-{git-short-hash}`

## Prerequisites

Since this application makes use of git and docker, the two applications must be preinstalled on the system. Additionally, the directory in which the application is executed, must contain a valid **package.json** and **Dockerfile**.


## Usage

You can use this utilty by installing it globally and executing it in your project's root directory:

```
npm i -g  docker-snapshot-image
cd /path/to/your/project
docker-snapshot-image
```
For a project with the following package.json:
```
{
  "name": "my-project",
  "version": "1.1.0",
  ...
}
```

executing the command would result in an image with a tag of the follwoing shape `my-project:1.1.0-f941929`. The hash appended to the version of the images always matches the short-version of the project's current git commit.

For advanced usage, command line flags can be used to change the default behavoir of the application:

| Flag                 | Description                                                                                           |
| ---------------------|-------------------------------------------------------------------------------------------------------|
| --fixed-tag <tag>    | Additionally tag the image with the specified tag (could be used to always add _latest_ tag to image) |
| --image-name <name>  | Use the specified custom name for the image                                                           |
| --no-auto            | Do not create the image with the automatic snapshot-tag ({pkg-version}-{commit-hash})                 |


However, for a fully detailed description of all flags that can be used, see the application's usage information (`docker-snapshot-image --help`).
