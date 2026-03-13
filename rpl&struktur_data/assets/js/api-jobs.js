// Jobs API Module
(function () {
  var API_BASE = "http://localhost:3000/api";

  function getToken() {
    return localStorage.getItem("bantuin_token");
  }

  function apiCall(endpoint, options) {
    var token = getToken();
    var headers = {
      "Content-Type": "application/json",
    };
    if (token) {
      headers["Authorization"] = "Bearer " + token;
    }

    var config = {
      method: options.method || "GET",
      headers: headers,
    };

    if (options.body) {
      config.body = JSON.stringify(options.body);
    }

    return fetch(API_BASE + endpoint, config).then(function (response) {
      return response.json().then(function (data) {
        if (!response.ok) {
          throw new Error(data.message || "API Error");
        }
        return data;
      });
    });
  }

  // Get all jobs with optional filters
  function getAllJobs(filters) {
    var query = "";
    if (filters) {
      var params = [];
      if (filters.search)
        params.push("search=" + encodeURIComponent(filters.search));
      if (filters.location)
        params.push("location=" + encodeURIComponent(filters.location));
      if (filters.job_type)
        params.push("job_type=" + encodeURIComponent(filters.job_type));
      if (filters.work_mode)
        params.push("work_mode=" + encodeURIComponent(filters.work_mode));
      if (filters.status)
        params.push("status=" + encodeURIComponent(filters.status));
      if (params.length > 0) {
        query = "?" + params.join("&");
      }
    }

    return apiCall("/jobs" + query, { method: "GET" }).then(function (
      response
    ) {
      if (response.success) {
        return response.data || [];
      }
      return [];
    });
  }

  // Get single job by ID
  function getJobById(jobId) {
    return apiCall("/jobs/" + jobId, { method: "GET" }).then(function (
      response
    ) {
      if (response.success) {
        return response.data;
      }
      return null;
    });
  }

  // Create new job (requires auth)
  function createJob(jobData) {
    return apiCall("/jobs", { method: "POST", body: jobData }).then(function (
      response
    ) {
      return response;
    });
  }

  // Update job (requires auth)
  function updateJob(jobId, jobData) {
    return apiCall("/jobs/" + jobId, { method: "PUT", body: jobData }).then(
      function (response) {
        return response;
      }
    );
  }

  // Delete job (requires auth)
  function deleteJob(jobId) {
    return apiCall("/jobs/" + jobId, { method: "DELETE" }).then(function (
      response
    ) {
      return response;
    });
  }

  // Save/unsave job (requires auth)
  function toggleSaveJob(jobId) {
    return apiCall("/jobs/" + jobId + "/save", { method: "POST" }).then(
      function (response) {
        return response;
      }
    );
  }

  // Get saved jobs (requires auth)
  function getSavedJobs() {
    return apiCall("/jobs/saved", { method: "GET" }).then(function (response) {
      if (response.success) {
        return response.data || [];
      }
      return [];
    });
  }

  // Expose API
  window.JobsAPI = {
    getAllJobs: getAllJobs,
    getJobById: getJobById,
    createJob: createJob,
    updateJob: updateJob,
    deleteJob: deleteJob,
    toggleSaveJob: toggleSaveJob,
    getSavedJobs: getSavedJobs,
  };
})();
