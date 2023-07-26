# Setting Up a Hugo Site Using AWS Amplify

This README guides you through the process of setting up a Hugo site by forking a GitHub repository and deploying it using AWS Amplify.

## Prerequisites

1. An AWS account
2. A GitHub account
3. Basic knowledge of Git commands

## Steps

### Fork the Repository

1. Navigate to to this repository. 

2. Click on the 'Fork' button at the top right of the page.

3. Select the account you want to fork the repository to.

Now, you have a copy of my hugo repository in your GitHub account.

### Clone the Repository

1. Go to your GitHub account, open the forked repository.

2. Click on the 'Code' button, then click the clipboard icon to copy the repository URL.

3. Open a terminal, navigate to the directory where you want to clone the repository.

4. Run `git clone <repository-url>`.

Now, you have the repository files on your local machine.

### Set Up AWS Amplify

1. Navigate to the AWS Amplify console.

2. Click 'Get Started' under 'Deliver'.

3. Click 'Host web app'.

4. Choose 'GitHub' as the repository service.

5. Connect to GitHub and select the forked repository.

6. Select the branch to deploy (usually 'main' or 'master').

7. For the 'Build settings', choose 'Hugo' as the web app framework.

8. Make sure to configure your build file so that it builds against Hugo Extended. 
```
    version: 1
    frontend:
    phases:
        preBuild:
        commands:
            - wget https://github.com/gohugoio/hugo/releases/download/v${VERSION_HUGO}/hugo_extended_${VERSION_HUGO}_Linux-64bit.tar.gz
            - tar --overwrite -xf hugo_extended_${VERSION_HUGO}_Linux-64bit.tar.gz hugo
            - mv hugo /usr/bin/hugo
            - rm -rf hugo_extended_${VERSION_HUGO}_Linux-64bit.tar.gz
            - hugo version
        build:
        commands:
            - hugo
    artifacts:
        baseDirectory: public
        files:
        - '**/*'
    cache:
        paths: []
```

9. Create an environmental variable, name it VERSION_HUGO, and give it a value. At the time of writing, Hugo is at version 0.115.4

10. Click 'Next', then 'Save and deploy'.

AWS Amplify will now build and deploy your Hugo site.

## Access Your Site

Once the build and deploy process is complete, AWS Amplify will provide a URL to access your site.

Congratulations! You have successfully set up a Hugo site using AWS Amplify.