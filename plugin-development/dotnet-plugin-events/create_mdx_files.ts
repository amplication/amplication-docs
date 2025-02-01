#!/usr/bin/env deno run --allow-write

const markdownContent = `<markdown_page filename="create-server.mdx">
---
title: Create Server
description: Initializes the creation of the .NET server.
---

## Event Name

\`CreateServer\`

## Event Parameters

This event does not use any additional parameters.

</markdown_page>

<markdown_page filename="create-server-appsettings.mdx">
---
title: Create Server Appsettings
description: Creates or updates the appsettings.json file for the .NET server
---

## Event Name

\`CreateServerAppsettings\`

## Event Parameters

<ResponseField name="updateProperties" type="Record<string, any>">
  Key-value pairs of properties to update in the server's appsettings.json file
</ResponseField>

<RequestExample>
\`\`\`ts Example
beforeCreateServerAppsettings(
  context: dotnetTypes.DsgContext,
  eventParams: dotnet.CreateServerAppsettingsParams
) {
  const { port, password, user, host, dbName } = getPluginSettings(
    context.pluginInstallations
  );

  eventParams.updateProperties = {
    ...eventParams.updateProperties,
    ConnectionStrings: {
      [CONNECTION_STRING]: \`Host=\${host}:\${port};Username=\${user};Password=\${password};Database=\${dbName}\`,
    },
  };
  return eventParams;
}
\`\`\`
</RequestExample>
</markdown_page>

<markdown_page filename="create-server-auth.mdx">
---
title: Create Server Auth
description: Sets up authentication for the .NET server.
---

## Event Name

\`CreateServerAuth\`

## Event Parameters

This event does not use any additional parameters.

<RequestExample>
\`\`\`ts Example
afterCreateServerAuth(
  context: dotnetTypes.DsgContext,
  eventParams: dotnet.CreateServerAuthParams,
  files: FileMap<Class>
): Promise<FileMap<Class>> {
  const authFile = files.get("Auth/AuthService.cs");
  if (authFile) {
    authFile.code.addMethod(
      CsharpSupport.method({
        name: "ValidateToken",
        access: "public",
        returnType: CsharpSupport.Types.boolean(),
        parameters: [
          CsharpSupport.parameter({
            name: "token",
            type: CsharpSupport.Types.string(),
          }),
        ],
        body: "// Add token validation logic here\\nreturn true;",
      })
    );
  }
  return files;
}
\`\`\`
</RequestExample>
</markdown_page>

<markdown_page filename="create-program-file.mdx">
---
title: Create Program File
description: Creates the main Program.cs file for the .NET application.
---

## Event Name

\`CreateProgramFile\`

## Event Parameters

<ResponseField name="builderServicesBlocks" type="CodeBlock[]">
  An array of code blocks to be added to the \`builder.Services\` section in \`Program.cs\`.
</ResponseField>

<ResponseField name="appBlocks" type="CodeBlock[]">
  An array of code blocks to be added to the application configuration section in \`Program.cs\`.
</ResponseField>

<RequestExample>
\`\`\`ts Example
beforeCreateProgramFile(
  { resourceInfo }: dotnetTypes.DsgContext,
  eventParams: dotnet.CreateProgramFileParams
) {
  const serviceNamespace = pascalCase(resourceInfo?.name ?? "");
  const serviceDbContext = \`\${pascalCase(resourceInfo?.name ?? "")}DbContext\`;
  eventParams.builderServicesBlocks.push(
    new CodeBlock({
      code: \`builder.Services.AddDbContext<\${serviceDbContext}>(opt => opt.UseNpgsql(builder.Configuration.GetConnectionString("\${CONNECTION_STRING}")));\`,
      references: [
        new ClassReference({
          name: "AddDbContext",
          namespace: "Microsoft.EntityFrameworkCore",
        }),
        new ClassReference({
          name: serviceDbContext,
          namespace: \`\${serviceNamespace}.Infrastructure\`,
        }),
      ],
    })
  );

  return eventParams;
}
\`\`\`
</RequestExample>
</markdown_page>

<markdown_page filename="create-server-csproj.mdx">
---
title: Create Server Csproj
description: Creates or updates the .csproj file for the .NET server.
---

## Event Name

\`CreateServerCsproj\`

## Event Parameters

<ResponseField name="propertyGroup" type="Record<string, string>">
  Key-value pairs of properties to update within the \`<PropertyGroup>\` section of the .csproj file.
</ResponseField>

<ResponseField name="packageReferences" type="Array">
  An array of package references to add or update in the \`<ItemGroup>\` section of the .csproj file. Each item is an object with the following structure:

  <Expandable title="properties">
    <ResponseField name="include" type="string">
      The package name to include.
    </ResponseField>
    <ResponseField name="version" type="string">
      The version of the package.
    </ResponseField>
    <ResponseField name="includeAssets" type="string">
      Optional. Specifies assets to include.
    </ResponseField>
    <ResponseField name="privateAssets" type="string">
      Optional. Specifies private assets.
    </ResponseField>
  </Expandable>
</ResponseField>

<RequestExample>
\`\`\`ts Example
beforeCreateServerCsproj(
  _: dotnetTypes.DsgContext,
  eventParams: dotnet.CreateServerCsprojParams
) {
  eventParams.packageReferences.push({
    include: "Npgsql.EntityFrameworkCore.PostgreSQL",
    version: "8.0.4",
  });

  return eventParams;
}
\`\`\`
</RequestExample>
</markdown_page>

<markdown_page filename="create-server-docker-compose.mdx">
---
title: Create Server Docker Compose
description: Creates or updates the Docker Compose file for the .NET server.
---

## Event Name

\`CreateServerDockerCompose\`

## Event Parameters

<ResponseField name="fileContent" type="string">
  The current content of the Docker Compose file.
</ResponseField>

<ResponseField name="updateProperties" type="Array">
  An array of properties to update or add to the Docker Compose file. Each item is expected to be compatible with the structure of the Docker Compose YAML.
</ResponseField>

<ResponseField name="outputFileName" type="string">
  The name of the Docker Compose output file.
</ResponseField>

<RequestExample>
\`\`\`ts Example
beforeCreateServerDockerCompose(
  context: dotnetTypes.DsgContext,
  eventParams: dotnet.CreateServerDockerComposeParams
) {
  const settings = getPluginSettings(context.pluginInstallations);

  eventParams.updateProperties.push(
    ...updateDockerComposeProperties(settings)
  );
  return eventParams;
}
\`\`\`
</RequestExample>
</markdown_page>

<markdown_page filename="create-server-git-ignore.mdx">
---
title: Create Server Git Ignore
description: Creates the .gitignore file for the server.
---

## Event Name

\`CreateServerGitIgnore\`

## Event Parameters

<ResponseField name="gitignorePaths" type="string[]">
  An array of paths to be added to the \`.gitignore\` file.
</ResponseField>

<RequestExample>
\`\`\`ts Example
beforeCreateServerGitIgnore(
  context: dotnetTypes.DsgContext,
  eventParams: dotnet.CreateServerGitIgnoreParams
): Promise<dotnet.CreateServerGitIgnoreParams> {
  eventParams.gitignorePaths.push(
    "*.user",
    "*.userosscache",
    "*.sln.docstates",
    "[Tt]est[Rr]esult*"
  );
  return eventParams;
}
\`\`\`
</RequestExample>
</markdown_page>

<markdown_page filename="create-entity-model.mdx">
---
title: Create Entity Model
description: Creates a model class for a specific entity in the .NET application.
---

## Event Name

\`CreateEntityModel\`

## Event Parameters

<ResponseField name="entity" type="Entity">
  The entity object for which the model class is being created.
</ResponseField>

<ResponseField name="entities" type="Entity[]">
  An array of all entities in the application.
</ResponseField>

<ResponseField name="resourceName" type="string">
  The name of the resource (typically the entity name).
</ResponseField>

<ResponseField name="apisDir" type="string">
  The directory where the API related files are being generated.
</ResponseField>

<RequestExample>
\`\`\`ts Example
afterCreateEntityModel(
  context: dotnetTypes.DsgContext,
  eventParams: dotnet.CreateEntityModelParams,
  files: FileMap<Class>
): Promise<FileMap<Class>> {
  const { entity, resourceName } = eventParams;
  const modelFile = files.get(\`\${resourceName}/Models/\${entity.name}.cs\`);
  if (modelFile) {
    modelFile.code.addAttribute(
      CsharpSupport.attribute({
        name: "Table",
        arguments: [\`"\${entity.name}s"\`],
      })
    );
  }
  return files;
}
\`\`\`
</RequestExample>
</markdown_page>

<markdown_page filename="create-resource-db-context-file.mdx">
---
title: Create Resource Db Context File
description: Creates the database context file for the .NET application.
---

## Event Name

\`CreateResourceDbContextFile\`

## Event Parameters

<ResponseField name="entities" type="Entity[]">
  An array of all entities in the application.
</ResponseField>

<ResponseField name="resourceName" type="string">
  The name of the resource (typically the entity name).
</ResponseField>

<ResponseField name="resourceDbContextPath" type="string">
  The path where the database context file will be created.
</ResponseField>

<RequestExample>
\`\`\`ts Example
afterCreateResourceDbContextFile(
  context: dotnetTypes.DsgContext,
  eventParams: dotnet.CreateResourceDbContextFileParams,
  files: FileMap<Class>
): FileMap<Class> {
  const { resourceDbContextPath, resourceName } = eventParams;

  const modelFile = files.get(
    \`\${resourceDbContextPath}\${resourceName}DbContext.cs\`
  );

  if (!modelFile) return files;

  modelFile.code.parentClassReference = CsharpSupport.genericClassReference({
    reference: CsharpSupport.classReference({
      name: \`IdentityDbContext\`,
      namespace: "Microsoft.AspNetCore.Identity.EntityFrameworkCore",
    }),
    innerType: CsharpSupport.Types.reference(
      CsharpSupport.classReference({
        name: \`IdentityUser\`,
        namespace: "Microsoft.AspNetCore.Identity",
      })
    ),
  });

  return files;
}
\`\`\`
</RequestExample>
</markdown_page>

<markdown_page filename="create-message-broker.mdx">
---
title: Create Message Broker
description: Sets up the message broker configuration for the .NET server.
---

## Event Name

\`CreateMessageBroker\`

## Event Parameters

This event does not use any additional parameters.

</markdown_page>

<markdown_page filename="create-message-broker-client-options-factory.mdx">
---
title: Create Message Broker Client Options Factory
description: Creates the client options factory for the message broker.
---

## Event Name

\`CreateMessageBrokerClientOptionsFactory\`

## Event Parameters

This event does not use any additional parameters.

<RequestExample>
\`\`\`ts Example
afterCreateMessageBrokerClientOptionsFactory(
  context: dotnetTypes.DsgContext,
  eventParams: dotnet.CreateMessageBrokerClientOptionsFactoryParams,
  files: FileMap<Class>
): Promise<FileMap<Class>> {
  const optionsFactoryFile = files.get("MessageBroker/MessageBrokerClientOptionsFactory.cs");
  if (optionsFactoryFile) {
    optionsFactoryFile.code.addMethod(
      CsharpSupport.method({
        name: "CreateConsumerConfig",
        access: "public",
        returnType: CsharpSupport.Types.reference("ConsumerConfig"),
        body: \`return new ConsumerConfig { GroupId = "my-consumer-group" };\`,
      })
    );
  }
  return files;
}
\`\`\`
</RequestExample>
</markdown_page>

<markdown_page filename="create-message-broker-service.mdx">
---
title: Create Message Broker Service
description: Creates the service for the message broker.
---

## Event Name

\`CreateMessageBrokerService\`

## Event Parameters

This event does not use any additional parameters.

<RequestExample>
\`\`\`ts Example
async afterCreateMessageBrokerService(
  dsgContext: dotnetTypes.DsgContext,
  eventParams: dotnet.CreateMessageBrokerServiceParams,
  files: FileMap<Class>
): Promise<FileMap<Class>> {
  const messageBrokerFiles = await createMessageBroker(dsgContext);
  await files.merge(messageBrokerFiles);
  return files;
}
\`\`\`
</RequestExample>
</markdown_page>

<markdown_page filename="create-entity-controller.mdx">
---
title: Create Entity Controller
description: Creates a controller for a specific entity in the .NET application.
---

## Event Name

\`CreateEntityController\`

## Event Parameters

<ResponseField name="entity" type="Entity">
  The entity object for which the controller is being created.
</ResponseField>

<ResponseField name="resourceName" type="string">
  The name of the resource (typically the entity name).
</ResponseField>

<ResponseField name="apisDir" type="string">
  The directory where the API controllers are being generated.
</ResponseField>

<ResponseField name="entityActions" type="object">
  An object containing the CRUD actions available for the entity.
</ResponseField>

<RequestExample>
\`\`\`ts Example
afterCreateEntityController(
  context: dotnetTypes.DsgContext,
  eventParams: dotnet.CreateEntityControllerParams,
  files: FileMap<Class>
): Promise<FileMap<Class>> {
  const { entity, resourceName, apisDir } = eventParams;
  const controllerPath = \`\${apisDir}/\${entity.name}/\${pascalCase(entity.name)}Controller.cs\`;
  const controllerFile = files.get(controllerPath);

  if (controllerFile) {
    // Add a custom action to the controller
    controllerFile.code.addMethod(
      CsharpSupport.method({
        name: "ExportToCsv",
        access: "public",
        isAsync: true,
        returnType: CsharpSupport.Types.task(CsharpSupport.Types.reference("IActionResult")),
        decorators: [
          CsharpSupport.decorator({
            name: "HttpGet",
            arguments: ["export-csv"],
          }),
        ],
        body: \`
          var allItems = await _service.List();
          var csv = ConvertToCsv(allItems);
          return File(Encoding.UTF8.GetBytes(csv), "text/csv", "\${entity.name}Export.csv");
        \`,
      })
    );

    // Add necessary imports
    controllerFile.code.addImport("System.Text");
    controllerFile.code.addImport("Microsoft.AspNetCore.Mvc");
  }

  return files;
}
\`\`\`
</RequestExample>
</markdown_page>

<markdown_page filename="create-entity-controller-base.mdx">
---
title: Create Entity Controller Base
description: Creates a base controller for entities in the .NET application.
---

## Event Name

\`CreateEntityControllerBase\`

## Event Parameters

<ResponseField name="entity" type="Entity">
  The entity object for which the base controller is being created.
</ResponseField>

<ResponseField name="resourceName" type="string">
  The name of the resource (typically the entity name).
</ResponseField>

<ResponseField name="apisDir" type="string">
  The directory where the API controllers are being generated.
</ResponseField>

<ResponseField name="moduleActions" type="ModuleAction[]">
  An array of module actions available for the entity.
</ResponseField>

<ResponseField name="entities" type="Entity[]">
  An array of all entities in the application.
</ResponseField>

<RequestExample>
\`\`\`ts Example
afterCreateEntityControllerBase(
  context: dotnetTypes.DsgContext,
  eventParams: dotnet.CreateEntityControllerBaseParams,
  files: FileMap<Class>
): Promise<FileMap<Class>> {
  const { entity, resourceName, apisDir } = eventParams;
  const controllerBasePath = \`\${apisDir}/\${entity.name}/Base/\${pascalCase(entity.name)}ControllerBase.cs\`;
  const controllerBaseFile = files.get(controllerBasePath);

  if (controllerBaseFile) {
    // Add a protected method to the base controller
    controllerBaseFile.code.addMethod(
      CsharpSupport.method({
        name: "ValidateEntityState",
        access: "protected",
        returnType: CsharpSupport.Types.boolean(),
        parameters: [
          CsharpSupport.parameter({
            name: "entity",
            type: CsharpSupport.Types.reference(entity.name),
          }),
        ],
        body: \`
          if (entity == null)
            return false;

          // Add custom validation logic here
          return true;
        \`,
      })
    );

    // Modify existing methods to use the new validation
    const methods = controllerBaseFile.code.getMethods();
    methods.forEach(method => {
      if (method.name === \`Create\${entity.name}\` || method.name === \`Update\${entity.name}\`) {
        const existingBody = method.body;
        method.body = \`
          if (!ValidateEntityState(\${camelCase(entity.name)}))
            return BadRequest("Invalid entity state");

          \${existingBody}
        \`;
      }
    });
  }

  return files;
}
\`\`\`
</RequestExample>
</markdown_page>

<markdown_page filename="create-dtos.mdx">
---
title: Create DTOs
description: Creates Data Transfer Objects (DTOs) for a specific entity in the .NET application.
---

## Event Name

\`CreateDTOs\`

## Event Parameters

<ResponseField name="entity" type="Entity">
  The entity object for which DTOs are being created.
</ResponseField>

<ResponseField name="dtoName" type="string">
  The name of the DTO class to be created.
</ResponseField>

<ResponseField name="dtoBasePath" type="string">
  The base path where DTO files are generated.
</ResponseField>

<RequestExample>
\`\`\`ts Example
afterCreateDTOs(
  context: dotnetTypes.DsgContext,
  eventParams: dotnet.CreateDTOsParams,
  files: FileMap<Class>
): Promise<FileMap<Class>> {
  const { entity, dtoName } = eventParams;
  const dtoFile = files.get(\`DTOs/\${dtoName}.cs\`);
  if (dtoFile) {
    dtoFile.code.addProperty(
      CsharpSupport.property({
        name: "LastModified",
        type: CsharpSupport.Types.dateTime(),
      })
    );
  }
  return files;
}
\`\`\`
</RequestExample>
</markdown_page>

<markdown_page filename="create-entity-extensions.mdx">
---
title: Create Entity Extensions
description: Creates extension methods for entities in the .NET application.
---

## Event Name

\`CreateEntityExtensions\`

## Event Parameters

<ResponseField name="entity" type="Entity">
  The entity object for which extension methods are being created.
</ResponseField>

<ResponseField name="resourceName" type="string">
  The name of the resource (typically the entity name).
</ResponseField>

<ResponseField name="apisDir" type="string">
  The directory where the API related files are being generated.
</ResponseField>

<RequestExample>
\`\`\`ts Example
afterCreateEntityExtensions(
  context: dotnetTypes.DsgContext,
  eventParams: dotnet.CreateEntityExtensionsParams,
  files: FileMap<Class>
): Promise<FileMap<Class>> {
  const { entity, resourceName, apisDir } = eventParams;
  const extensionsPath = \`\${apisDir}/\${entity.name}/\${pascalCase(entity.name)}Extensions.cs\`;
  const extensionsFile = files.get(extensionsPath);

  if (extensionsFile) {
    // Add a custom extension method
    extensionsFile.code.addMethod(
      CsharpSupport.method({
        name: "ToAuditString",
        isStatic: true,
        returnType: CsharpSupport.Types.string(),
        parameters: [
          CsharpSupport.parameter({
            name: "this",
            type: CsharpSupport.Types.reference(entity.name),
            isThis: true,
          }),
        ],
        body: \`
          return "\${entity.Id}|\${entity.CreatedAt}|\${entity.UpdatedAt}";
        \`,
      })
    );

    // Add a custom mapper extension
    extensionsFile.code.addMethod(
      CsharpSupport.method({
        name: "ToDto",
        isStatic: true,
        returnType: CsharpSupport.Types.reference(\`\${entity.name}Dto\`),
        parameters: [
          CsharpSupport.parameter({
            name: "this",
            type: CsharpSupport.Types.reference(entity.name),
            isThis: true,
          }),
        ],
        body: \`
          return new \${entity.name}Dto
          {
            Id = entity.Id,
            // Map other properties here
            AuditString = entity.ToAuditString()
          };
        \`,
      })
    );
  }

  return files;
}
\`\`\`
</RequestExample>
</markdown_page>

<markdown_page filename="create-entity-interface.mdx">
---
title: Create Entity Interface
description: Creates an interface for entities in the .NET application.
---

## Event Name

\`CreateEntityInterface\`

## Event Parameters

<ResponseField name="entity" type="Entity">
  The entity object for which the interface is being created.
</ResponseField>

<ResponseField name="resourceName" type="string">
  The name of the resource (typically the entity name).
</ResponseField>

<ResponseField name="apisDir" type="string">
  The directory where the API related files are being generated.
</ResponseField>

<ResponseField name="moduleContainers" type="ModuleContainer[]">
  An array of module containers in the application.
</ResponseField>

<ResponseField name="moduleActions" type="ModuleAction[]">
  An array of module actions available in the application.
</ResponseField>

<ResponseField name="entities" type="Entity[]">
  An array of all entities in the application.
</ResponseField>

<RequestExample>
\`\`\`ts Example
afterCreateEntityInterface(
  context: dotnetTypes.DsgContext,
  eventParams: dotnet.CreateEntityInterfaceParams,
  files: FileMap<Interface>
): Promise<FileMap<Interface>> {
  const { entity } = eventParams;
  const interfaceFile = files.get(\`Interfaces/I\${entity.name}.cs\`);
  if (interfaceFile) {
    interfaceFile.code.addMethod(
      CsharpSupport.method({
        name: "Validate",
        returnType: CsharpSupport.Types.boolean(),
      })
    );
  }
  return files;
}
\`\`\`
</RequestExample>
</markdown_page>

<markdown_page filename="create-entity-service.mdx">
---
title: Create Entity Service
description: Creates a service for a specific entity in the .NET application.
---

## Event Name

\`CreateEntityService\`

## Event Parameters

<ResponseField name="entity" type="Entity">
  The entity object for which the service is being created.
</ResponseField>

<ResponseField name="resourceName" type="string">
  The name of the resource (typically the entity name).
</ResponseField>

<ResponseField name="apisDir" type="string">
  The directory where the API services are being generated.
</ResponseField>

<ResponseField name="entityActions" type="object">
  An object containing the CRUD actions available for the entity.
</ResponseField>

<RequestExample>
\`\`\`ts Example
afterCreateEntityService(
  context: dotnetTypes.DsgContext,
  eventParams: dotnet.CreateEntityServiceParams,
  files: FileMap<Class>
): Promise<FileMap<Class>> {
  const { entity, resourceName, apisDir } = eventParams;
  const servicePath = \`\${apisDir}/\${entity.name}/\${pascalCase(entity.name)}Service.cs\`;
  const serviceFile = files.get(servicePath);

  if (serviceFile) {
    // Add a custom method to the service
    serviceFile.code.addMethod(
      CsharpSupport.method({
        name: "GetRecentlyModified",
        access: "public",
        isAsync: true,
        returnType: CsharpSupport.Types.task(CsharpSupport.Types.list(CsharpSupport.Types.reference(entity.name))),
        parameters: [
          CsharpSupport.parameter({
            name: "days",
            type: CsharpSupport.Types.int(),
            defaultValue: "7",
          }),
        ],
        body: \`
          var cutoffDate = DateTime.UtcNow.AddDays(-days);
          return await _repository.GetAll()
            .Where(e => e.UpdatedAt >= cutoffDate)
            .OrderByDescending(e => e.UpdatedAt)
            .ToListAsync();
        \`,
      })
    );

    // Add necessary imports
    serviceFile.code.addImport("System");
    serviceFile.code.addImport("System.Linq");
    serviceFile.code.addImport("Microsoft.EntityFrameworkCore");
  }

  return files;
}
\`\`\`
</RequestExample>
</markdown_page>

<markdown_page filename="create-entity-service-base.mdx">
---
title: Create Entity Service Base
description: Creates a base service for entities in the .NET application.
---

## Event Name

\`CreateEntityServiceBase\`

## Event Parameters

<ResponseField name="entity" type="Entity">
  The entity object for which the base service is being created.
</ResponseField>

<ResponseField name="resourceName" type="string">
  The name of the resource (typically the entity name).
</ResponseField>

<ResponseField name="apisDir" type="string">
  The directory where the API services are being generated.
</ResponseField>

<ResponseField name="moduleActions" type="ModuleAction[]">
  An array of module actions available for the entity.
</ResponseField>

<ResponseField name="entities" type="Entity[]">
  An array of all entities in the application.
</ResponseField>

<RequestExample>
\`\`\`ts Example
afterCreateEntityServiceBase(
  context: dotnetTypes.DsgContext,
  eventParams: dotnet.CreateEntityServiceBaseParams,
  files: FileMap<Class>
): Promise<FileMap<Class>> {
  const { entity } = eventParams;
  const serviceBaseFile = files.get(\`Services/Base/\${entity.name}ServiceBase.cs\`);
  if (serviceBaseFile) {
    serviceBaseFile.code.addMethod(
      CsharpSupport.method({
        name: "SoftDelete",
        access: "protected",
        returnType: CsharpSupport.Types.task(CsharpSupport.Types.void()),
        parameters: [
          CsharpSupport.parameter({
            name: "id",
            type: CsharpSupport.Types.string(),
          }),
        ],
        body: "// Implement soft delete logic here",
      })
    );
  }
  return files;
}
\`\`\`
</RequestExample>
</markdown_page>

<markdown_page filename="create-seed-development-data-file.mdx">
---
title: Create Seed Development Data File
description: Creates a file for seeding development data in the .NET application.
---

## Event Name

\`CreateSeedDevelopmentDataFile\`

## Event Parameters

<ResponseField name="seedFilePath" type="string">
  The full path to the seed development data file being created.
</ResponseField>

<ResponseField name="resourceName" type="string">
  The name of the resource (typically the application name).
</ResponseField>

<RequestExample>
\`\`\`ts Example
afterCreateSeedDevelopmentDataFile(
  context: dotnetTypes.DsgContext,
  eventParams: dotnet.CreateSeedDevelopmentDataFileParams,
  files: FileMap<Class>
): FileMap<Class> {
  const { seedFilePath, resourceName } = eventParams;
  const { entities } = context;

  if (!entities) return files;

  const seedFile = files.get(seedFilePath);
  seedFile?.code.addMethod(
    CsharpSupport.method({
      name: "SeedDevUser",
      access: "public",
      isAsync: true,
      body: CreateSeedDevelopmentDataBody(resourceName, context),
      type: MethodType.STATIC,
      parameters: [
        CsharpSupport.parameter({
          name: "serviceProvider",
          type: CsharpSupport.Types.reference(
            CsharpSupport.classReference({
              name: "IServiceProvider",
              namespace: \`\${resourceName}.Infrastructure.Models\`,
            })
          ),
        }),
        CsharpSupport.parameter({
          name: "configuration",
          type: CsharpSupport.Types.reference(
            CsharpSupport.classReference({
              name: "IConfiguration",
              namespace: "",
            })
          ),
        }),
      ],
    })
  );

  return files;
}
\`\`\`
</RequestExample>
</markdown_page>

<markdown_page filename="load-static-files.mdx">
---
title: Load Static Files
description: Loads static files into the project.
---

## Event Name

\`LoadStaticFiles\`

## Event Parameters

<ResponseField name="source" type="string">
  The source directory containing the static files to load.
</ResponseField>

<ResponseField name="basePath" type="string">
  The base path in the project where static files should be loaded into.
</ResponseField>

<RequestExample>
\`\`\`ts Example
async afterLoadStaticFiles(
  context: dotnetTypes.DsgContext,
  eventParams: dotnet.LoadStaticFilesParams,
  files: FileMap<CodeBlock>
): Promise<FileMap<CodeBlock>> {
  const { resourceInfo } = context;
  if (!resourceInfo) return files;

  const resourceName = pascalCase(resourceInfo.name);

  const destPath = \`\${eventParams.basePath}/src/APIs/Common/Auth/ProgramAuthExtensions.cs\`;
  const filePath = resolve(
    __dirname,
    "./static/common/auth/ProgramAuthExtensions.cs"
  );

  const programAuthExtensionsFileMap = await createStaticFileFileMap(
    destPath,
    filePath,
    context,
    [
      CsharpSupport.classReference({
        name: \`\${resourceName}DbContext\`,
        namespace: \`\${resourceName}.Infrastructure\`,
      }),
    ]
  );

  return files;
}
\`\`\`
</RequestExample>
</markdown_page>
`;

const pageRegex = /<markdown_page filename="([^"]*)">([\s\S]*?)<\/markdown_page>/g;
const pages = markdownContent.matchAll(pageRegex);

if (pages) {
  for (const page of pages) {
    const filename = page[1];
    const content = page[2]?.trim() || "";

    if (filename) {
      try {
        await Deno.writeTextFile(filename, content);
        console.log(`Created file: ${filename}`);
      } catch (error) {
        console.error(`Error creating file ${filename}: ${error}`);
      }
    }
  }
} else {
  console.log("No markdown pages found in the content.");
}

console.log("Script finished.");