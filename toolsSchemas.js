const toolsSchemas = {
  createPatient: {
    name: "create_patient",
    description: "Creates a Patient user",
    parameters: {
      type: "object",
      properties: {
        // Add any specific parameters if needed
        name: { type: "string", description: "Name of the new patient" },
        email: { type: "string", description: "Email of the new patient" },
      },
      required: ["name", "email"], // Add required fields if applicable
    },
  },
  searchMyPatients: {
    name: "search_my_patients",
    description: "Search user patients by email or by name on my patient list",
    parameters: {
      type: "object",
      properties: {
        // Add any specific parameters if needed
        search: { type: "string", description: "Name or Email of the patient" },
      },
      required: ["search"], // Add required fields if applicable
    },
  },
  deleteMyPatient: {
    name: "delete_my_patient",
    description: "Delete one of my patient from my patients list, you will find it by email or by name",
    parameters: {
      type: "object",
      properties: {
        // Add any specific parameters if needed
        search: { type: "string", description: "Name or Email of the patient" },
      },
      required: ["search"], // Add required fields if applicable
    },
  },
  addMyPatient: {
    name: "add_my_patient",
    description: "Add one patient to my patients list, you will find it by email or by name",
    parameters: {
      type: "object",
      properties: {
        // Add any specific parameters if needed
        search: { type: "string", description: "Name or Email of the patient" },
      },
      required: ["search"], // Add required fields if applicable
    },
  },
  searchProvidersByEmailOrName: {
    name: "search_providers_by_name_or_email",
    description: "Search all Users that are providers, you will find specific users by email or by name",
    parameters: {
      type: "object",
      properties: {
        // Add any specific parameters if needed
        search: { type: "string", description: "Name or Email of the provider" },
      },
      required: ["search"], // Add required fields if applicable
    },
  },
  searchProvidersByCategories: {
    name: "search_providers_by_categories",
    description: "Search all Users that are providers, you will find specific users by category",
    parameters: {
      type: "object",
      properties: {
        // Add any specific parameters if needed
        search: { type: "string", description: "Name of the category" },
      },
      required: ["search"], // Add required fields if applicable
    },
},
  searchProvidersByCategoriesNameAndEmail: {
    name: "search_providers_by_categories_and_name_or_email",
    description: "Search all Users that are providers, you will find specific users by category and name or email",
    parameters: {
      type: "object",
      properties: {
        // Add any specific parameters if needed
        searchName: { type: "string", description: "Name or Email of the provider" },
        searchCategory: { type: "string", description: "Name of the category" },
      },
      required: ["searchName", "searchCategory"], // Add required fields if applicable8
    },
  },
  searchCategoriesByName: {
    name: "search_categories_by_name",
    description: "Search all all Categories that are available, you will find specific categories by name",
    parameters: {
      type: "object",
      properties: {
        // Add any specific parameters if needed
        search: { type: "string", description: "Name of the category" },
      },
      required: ["search"], // Add required fields if applicable
    },
  },
  // Add more schemas for other routes here
};

module.exports = toolsSchemas;