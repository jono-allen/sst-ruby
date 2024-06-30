/// <reference path="./.sst/platform/config.d.ts" />

export default $config({
  app(input) {
    return {
      name: "ruby-sst",
      removal: input.stage === "dev" ? "remove" : "retain",
      home: "aws",
      providers: {
        aws: {
          region: "us-east-2",
        },
      },
    };
  },
  async run() {
    const SOME_ENV = new sst.Secret("SomeEnv", "");

    const vpc = new sst.aws.Vpc("RubyVpc");
    const cluster = new sst.aws.Cluster("RubyCluster", { vpc });

    const service = cluster.addService("RubyApp", {
      image: {
        context: ".",
        dockerfile: "apps/Dockerfile",
      },
      public: {
        // requires setting up a route53 domain
        // domain: `api.${$app.stage}-some-domain.com`,
        ports: [
          { listen: "80/http", forward: "3002/http" },
          // can only use https when have an domain set
          // { listen: "443/https", forward: "3002/http" },
        ],
      },
      environment: {
        LOG_LEVEL: "debug",
        SOME_ENV: SOME_ENV.value,
      },
    });
  },
});
