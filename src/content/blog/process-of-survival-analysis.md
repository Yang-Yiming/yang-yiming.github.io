---
title: Process of Survival Analysis
summary: STA323 course project 1, an example of survival analaysis using PySpark.
meta: April 2026
date: 2026-04-18
kicker: Blog / 01
---

This analysis aims to characterize customer churn behavior in IBM's Telco dataset using survival analysis methods, with _tenure_ (months of subscription) as the time-to-event variable and _churn_ as the event of interest.

## Data Preprocessing

The raw dataset is first loaded as a bronze table. We applied two transformations on the bronze table: the churn column is converted from string to boolean, and the data is filtered to retain only internet subscribers on month-to-month contracts. This filtering is because month-to-month customers represent the highest churn-risk segment and are the most actionable target for retention efforts. The resulting curated dataset is referred to as the silver table.

## Kaplan-Meier

Applying the Kaplan-Meier estimator with _tenure_ as the time variable and _churn_ as the event indicator to estimate the population-level survival function. The result is shown in [Figure 1](#fig:q2plots): the median survival time is 34.0 months, meaning approximately half of the customers in this cohort churn within the first 34 months of subscription.

<figure id="fig:q2plots">
  <div style="display:grid; grid-template-columns:repeat(3, minmax(0, 1fr)); gap:1rem; align-items:start;">
    <figure style="margin:0;">
      <img src="/assets/blog/process-of-survival-analysis/Kaplan-Meier.jpg" alt="Result of Kaplan-Meier fit" style="width:100%; height:auto; display:block;" />
      <figcaption style="text-align:center;">(a) Result of Kaplan-Meier fit.</figcaption>
    </figure>
    <figure style="margin:0;">
      <img src="/assets/blog/process-of-survival-analysis/KM-gender.jpg" alt="KM fit on Gender" style="width:100%; height:auto; display:block;" />
      <figcaption style="text-align:center;">(b) KM fit on Gender</figcaption>
    </figure>
    <figure style="margin:0;">
      <img src="/assets/blog/process-of-survival-analysis/KM-paymentmethod.jpg" alt="KM fit on Payment Methods" style="width:100%; height:auto; display:block;" />
      <figcaption style="text-align:center;">(c) KM fit on Payment Methods</figcaption>
    </figure>
  </div>
</figure>

To examine whether specific customer attributes influence churn timing, select variables and apply the log-rank test to assess whether the resulting survival curves differ significantly across groups (threshold: $p < 0.05$).

As shown in [Figure 1](#fig:q2plots), the survival curves for Female and Male customers are nearly indistinguishable (log-rank $p = 0.153$), indicating that gender has no significant effect on tenure. In contrast, the payment method plot reveals a notable difference: credit card and bank transfer customers exhibit nearly identical survival behavior (log-rank $p = 0.804$), while all other pairwise comparisons yield p-values on the order of $10^{-10}$ to $10^{-21}$, suggesting that payment method is strongly associated with churn timing — likely reflecting underlying differences in customer engagement or financial commitment.

Applying this procedure across all available variables, the following are identified as statistically influential: _onlineSecurity, partner, multipleLines, internetService, streamingTV, streamingMovies, onlineBackup, deviceProtection, techSupport, paperlessBilling, paymentMethod_. These variables are carried forward into subsequent modeling steps.

## Cox Proportional Hazards

We fit a Cox Proportional Hazards model using four covariates identified in the previous step: _dependents, internetService, onlineBackup, techSupport_. The Cox PH model assumes that the hazard ratio between any two groups remains constant over time (_the proportional hazards assumption_), so we verify this assumption using three complementary methods before interpreting the results.

**Statistical Test:** The formal test rejects the proportional hazards assumption for _internetService_, _onlineBackup_, and _paymentMethod_ (p < 0.05), while _dependents_ passes (p = 0.22). This already suggests the model may not be fully appropriate for this data.

**Schoenfeld Residuals:** As shown in [Figure 2](#fig:cox-schoenfeld), a flat central line indicates that the variable's effect is stable over time and consistent with the assumption. Among the four variables, _internetService_ is relatively stable, while _onlineBackup_ shows a clear time-dependent pattern, and _techSupport_ shows a moderate one.

**Log-log Kaplan-Meier Plots:** If the proportional hazards assumption holds, the curves in a log-log plot should appear roughly parallel. As shown in [Figure 3](#fig:q2loglog), the curves are mostly parallel when log(timeline) falls between 1 and 3, but diverge outside this range — and _internetService_ shows non-parallel behavior even within it.

Taken together, the three checks consistently indicate that the proportional hazards assumption is violated for most covariates. This means the Cox PH model's hazard ratios should be interpreted with caution, as the effect of these variables on churn risk is not constant over the customer lifetime.

<figure id="fig:cox-schoenfeld">
  <div style="display:grid; grid-template-columns:repeat(2, minmax(0, 1fr)); gap:1rem; align-items:start;">
    <figure style="margin:0;">
      <img src="/assets/blog/process-of-survival-analysis/q2schoenfeld_1.jpg" alt="Plots for dependents" style="width:100%; height:auto; display:block;" />
      <figcaption style="text-align:center;">(a) Plots for _dependents_</figcaption>
    </figure>
    <figure style="margin:0;">
      <img src="/assets/blog/process-of-survival-analysis/q2schoenfeld_2.jpg" alt="Plots for InternetService" style="width:100%; height:auto; display:block;" />
      <figcaption style="text-align:center;">(b) Plots for _InternetService_</figcaption>
    </figure>
  </div>
  <figcaption style="text-align:center;">Schoenfeld Residuals plots.</figcaption>
</figure>

<figure id="fig:q2loglog">
  <div style="display:grid; grid-template-columns:repeat(4, minmax(0, 1fr)); gap:1rem; align-items:start;">
    <figure style="margin:0;">
      <img src="/assets/blog/process-of-survival-analysis/q2loglogkm1.jpg" alt="online backup" style="width:100%; height:auto; display:block;" />
      <figcaption style="text-align:center;">(a) online backup</figcaption>
    </figure>
    <figure style="margin:0;">
      <img src="/assets/blog/process-of-survival-analysis/q2loglogkm2.jpg" alt="dependents" style="width:100%; height:auto; display:block;" />
      <figcaption style="text-align:center;">(b) dependents</figcaption>
    </figure>
    <figure style="margin:0;">
      <img src="/assets/blog/process-of-survival-analysis/q2loglogkm3.jpg" alt="internet service" style="width:100%; height:auto; display:block;" />
      <figcaption style="text-align:center;">(c) internet service</figcaption>
    </figure>
    <figure style="margin:0;">
      <img src="/assets/blog/process-of-survival-analysis/q2loglogkm4.jpg" alt="tech support" style="width:100%; height:auto; display:block;" />
      <figcaption style="text-align:center;">(d) tech support</figcaption>
    </figure>
  </div>
  <figcaption style="text-align:center;">Log-log Kaplan-Meier plots</figcaption>
</figure>

## Accelerated Failure Time

Unlike the non-parametric KM estimator and semi-parametric Cox model, the Accelerated Failure Time (AFT) model is fully parametric: it assumes the outcome follows a specific distribution, and models how covariates accelerate or decelerate the time to event. Formally, the survival functions of two groups are related by $S_A(t) = \lambda \cdot S_B(t)$, where $\lambda$ is the acceleration factor.

We fit a Log-Logistic AFT model to the data. The median survival time is estimated at 135.51 months, notably higher than the KM estimate of 34.0 — reflecting that the AFT model conditions on the full covariate profile rather than the population average. All covariates are statistically significant (p < 0.005). The acceleration factors ($exp("coef")$) are interpretable directly: values greater than 1 indicate longer time-to-churn relative to the baseline. For example, _onlineBackup_Yes_ has exp(coef) = 2.25, meaning customers with online backup churn 2.25× slower than those without. The model achieves a concordance of 0.73, indicating reasonable discriminative performance.

To assess whether the log-logistic distribution is an appropriate choice, we examine log-log plots of the survival function. As shown in [Figure 4](#fig:loglogAFT), most curves are approximately straight, supporting the distributional assumption. However, the curves are largely non-parallel across groups, which violates the AFT model's core assumption of a constant multiplicative effect. This suggests that while the log-logistic distribution fits the marginal survival reasonably well, the AFT model is not fully appropriate for this dataset.

<figure id="fig:loglogAFT">
  <div style="display:grid; grid-template-columns:repeat(3, minmax(0, 1fr)); gap:1rem; align-items:start;">
    <figure style="margin:0;">
      <img src="/assets/blog/process-of-survival-analysis/q2loglogpartner.jpg" alt="partner" style="width:100%; height:auto; display:block;" />
      <figcaption style="text-align:center;">(a) partner</figcaption>
    </figure>
    <figure style="margin:0;">
      <img src="/assets/blog/process-of-survival-analysis/q2loglogmultiplelines.jpg" alt="multiple lines" style="width:100%; height:auto; display:block;" />
      <figcaption style="text-align:center;">(b) multiple lines</figcaption>
    </figure>
    <figure style="margin:0;">
      <img src="/assets/blog/process-of-survival-analysis/q2logloginternetservice.jpg" alt="internet service" style="width:100%; height:auto; display:block;" />
      <figcaption style="text-align:center;">(c) internet service</figcaption>
    </figure>
  </div>
  <figcaption style="text-align:center;">A selection of the log-log plots for AFT model</figcaption>
</figure>

## Customer Lifetime Value

Building on the Cox PH model fitted above, we estimate the Customer Lifetime Value (CLV) for a customer with a given covariate profile. Despite the proportional hazards assumption being partially violated, the Cox model still provides a useful approximation for CLV estimation in practice.

The survival probability curve ([Figure 5](#fig:customerlifetimevalue)) shows the predicted probability that this customer remains active over time. As tenure increases, the survival probability declines — this curve serves as the foundation for the CLV calculation by weighting future revenue by the probability that the customer is still subscribed at each point in time.

The cumulative NPV chart ([Figure 5](#fig:customerlifetimevalue)) translates this into a business-interpretable quantity: the expected discounted revenue from this customer over 12, 24, and 36 months. This directly answers the question of how much a firm should be willing to spend to acquire or retain a customer of this profile — spending beyond the corresponding NPV would result in a net loss.

Overall, this analysis demonstrates that survival analysis provides a principled framework for understanding churn dynamics and informing retention decisions. The KM and log-rank tests effectively identified influential variables; however, both the Cox PH and AFT models showed assumption violations on this dataset, suggesting that more flexible approaches (such as time-varying Cox models or machine learning-based survival models) may yield more reliable estimates in future work.

<figure id="fig:customerlifetimevalue">
  <div style="display:grid; grid-template-columns:repeat(2, minmax(0, 1fr)); gap:1rem; align-items:start;">
    <figure style="margin:0;">
      <img src="/assets/blog/process-of-survival-analysis/survivalprobabilitycurve.jpg" alt="Survival Probability Curve Chart" style="width:100%; height:auto; display:block;" />
      <figcaption style="text-align:center;">(a) Survival Probability Curve Chart</figcaption>
    </figure>
    <figure style="margin:0;">
      <img src="/assets/blog/process-of-survival-analysis/cumulativenpv.jpg" alt="Cumulative NPV chart" style="width:100%; height:auto; display:block;" />
      <figcaption style="text-align:center;">(b) Cumulative NPV chart</figcaption>
    </figure>
  </div>
  <figcaption style="text-align:center;">Customer Lifetime Value Charts</figcaption>
</figure>
