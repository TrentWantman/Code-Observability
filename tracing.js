const { Resource } = require("@opentelemetry/resources");
const { SemanticResourceAttributes } = require("@opentelemetry/semantic-conventions");
const { NodeTracerProvider } = require("@opentelemetry/sdk-trace-node");
const { SimpleSpanProcessor } = require("@opentelemetry/sdk-trace-base");
const { JaegerExporter } = require("@opentelemetry/exporter-jaeger");
const { trace } = require("@opentelemetry/api");

// Instrumentations
const { ExpressInstrumentation } = require("opentelemetry-instrumentation-express");
const { MongoDBInstrumentation } = require("@opentelemetry/instrumentation-mongodb");
const { HttpInstrumentation } = require("@opentelemetry/instrumentation-http");
const { registerInstrumentations } = require("@opentelemetry/instrumentation");

// Exporter setup
module.exports = (serviceName) => {
  // Configure the Jaeger Exporter
  const exporter = new JaegerExporter({
    endpoint: "http://localhost:14268/api/traces", // Jaeger endpoint for sending spans
  });

  // Configure the Tracer Provider
  const provider = new NodeTracerProvider({
    resource: new Resource({
      [SemanticResourceAttributes.SERVICE_NAME]: serviceName, // Define your service name
    }),
  });

  // Add the span processor for exporting spans
  provider.addSpanProcessor(new SimpleSpanProcessor(exporter));
  provider.register();

  // Register instrumentations for tracing
  registerInstrumentations({
    instrumentations: [
      new HttpInstrumentation(),
      new ExpressInstrumentation(),
      new MongoDBInstrumentation(),
    ],
    tracerProvider: provider,
  });

  // Return the tracer instance
  return trace.getTracer(serviceName);
};
