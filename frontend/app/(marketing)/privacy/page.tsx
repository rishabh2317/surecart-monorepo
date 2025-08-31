// app/(marketing)/privacy/page.tsx
import Link from "next/link";

export default function PrivacyPage() {
  return (
    <div className="bg-white py-12">
      <main className="container mx-auto px-4 py-16 text-slate-700 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight">
              Privacy Policy
            </h1>
            <p className="mt-2 text-lg text-slate-600">
              Last updated: August 14, 2025
            </p>
          </div>

          <div className="prose prose-slate max-w-none prose-p:text-slate-700 prose-a:text-teal-600 hover:prose-a:text-teal-700">
            <p>
              Welcome to Stash. This Privacy Policy explains how we collect,
              use, disclose, and safeguard your information when you visit our
              website. Please read this privacy policy carefully. If you do not
              agree with the terms of this privacy policy, please do not access
              the site.
            </p>
            <>
              <h3>
                <strong>1.0 Introduction and Definitions</strong>
              </h3>
              <p>
                <br />
                <br />
              </p>
              <h4>
                <strong>1.1 Preamble</strong>
              </h4>
              <p>&nbsp;</p>
              <p>
                <span style={{ fontWeight: 400 }}>
                  This Privacy Policy (&quot;Policy&quot;) is issued by Mystash Pvt Ltd, a
                  company incorporated under the laws of India, with its
                  registered office at B308, JP Nagar, Bangalore, Karnataka,
                  India (hereinafter referred to as &quot;Mystash&quot;, &quot;We&quot;, &quot;Us&quot;, or
                  &quot;Our&quot;). This Policy outlines our practices and procedures
                  regarding the collection, processing, use, storage,
                  disclosure, and protection of your Personal Data when you use
                  our online platform, including our website and mobile
                  applications (collectively, the &quot;Platform&quot;).
                </span>
              </p>
              <p>
                <span style={{ fontWeight: 400 }}>
                  The purpose of this Policy is to provide you, the user
                  (&quot;User&quot;, &quot;You&quot;, &quot;Your&quot;), with a clear and comprehensive
                  understanding of how we handle your Personal Data in
                  compliance with applicable Indian laws. By accessing or using
                  our Platform, you signify your understanding of and agreement
                  with the terms of this Privacy Policy.
                </span>
              </p>
              <p>&nbsp;</p>
              <h4>
                <strong>1.2 Applicability</strong>
              </h4>
              <p>&nbsp;</p>
              <p>
                <span style={{ fontWeight: 400 }}>
                  This Policy applies to all individuals and entities who
                  access, register on, or use the services offered on the
                  Mystash Platform, including but not limited to content
                  creators (&quot;Creators&quot;), individuals or entities purchasing
                  services (&quot;Customers&quot;), and brands engaging with Creators
                  (&quot;Brands&quot;).
                </span>
              </p>
              <p>
                <span style={{ fontWeight: 400 }}>
                  In accordance with India&apos;s data protection framework, this
                  Policy has an extraterritorial scope. It applies to the
                  processing of digital personal data within the territory of
                  India. Furthermore, it extends to the processing of digital
                  personal data outside the territory of India if such
                  processing is in connection with any activity related to the
                  offering of goods or services to individuals within India.
                </span>
                <span style={{ fontWeight: 400 }}>1</span>
                <span style={{ fontWeight: 400 }}>
                  {" "}
                  Therefore, this Policy is applicable to all our users,
                  regardless of their geographical location, as long as they are
                  engaging with our services offered in India.
                </span>
              </p>
              <p>&nbsp;</p>
              <h4>
                <strong>1.3 Definitions</strong>
              </h4>
              <p>&nbsp;</p>
              <p>
                <span style={{ fontWeight: 400 }}>
                  Unless the context otherwise requires, the terms defined in
                  this section shall have the meanings ascribed to them
                  throughout this Policy. These definitions are aligned with the
                  provisions of the Digital Personal Data Protection Act, 2023
                  (&quot;DPDP Act&quot;) and other relevant Indian legislation.
                </span>
              </p>
              <ul>
                <li style={{ fontWeight: 400 }}>
                  <strong>Personal Data:</strong>
                  <span style={{ fontWeight: 400 }}>
                    {" "}
                    Means any data about an individual who is identifiable by or
                    in relation to such data.
                  </span>
                  <span style={{ fontWeight: 400 }}>1</span>
                </li>
                <li style={{ fontWeight: 400 }}>
                  <strong>Digital Personal Data:</strong>
                  <span style={{ fontWeight: 400 }}>
                    {" "}
                    Means Personal Data in digital form.
                  </span>
                  <span style={{ fontWeight: 400 }}>1</span>
                </li>
                <li style={{ fontWeight: 400 }}>
                  <strong>Data Fiduciary:</strong>
                  <span style={{ fontWeight: 400 }}>
                    {" "}
                    Means any person who alone or in conjunction with other
                    persons determines the purpose and means of processing of
                    personal data. For the purposes of this Policy, Mystash Pvt
                    Ltd is the Data Fiduciary.
                  </span>
                  <span style={{ fontWeight: 400 }}>3</span>
                </li>
                <li style={{ fontWeight: 400 }}>
                  <strong>Data Processor:</strong>
                  <span style={{ fontWeight: 400 }}>
                    {" "}
                    Means any person who processes personal data on behalf of a
                    Data Fiduciary.
                  </span>
                  <span style={{ fontWeight: 400 }}>3</span>
                </li>
                <li style={{ fontWeight: 400 }}>
                  <strong>Data Principal:</strong>
                  <span style={{ fontWeight: 400 }}>
                    {" "}
                    Means the individual to whom the personal data relates. In
                    the context of this Policy, You, the User, are the Data
                    Principal.
                  </span>
                  <span style={{ fontWeight: 400 }}>3</span>
                </li>
                <li style={{ fontWeight: 400 }}>
                  <strong>Processing:</strong>
                  <span style={{ fontWeight: 400 }}>
                    {" "}
                    In relation to personal data, means a wholly or partially
                    automated operation or set of operations performed on
                    digital personal data, and includes operations such as
                    collection, recording, organisation, structuring, storage,
                    adaptation, retrieval, use, alignment or combination,
                    indexing, sharing, disclosure by transmission, dissemination
                    or otherwise making available, restriction, erasure or
                    destruction.
                  </span>
                  <span style={{ fontWeight: 400 }}>1</span>
                </li>
                <li style={{ fontWeight: 400 }}>
                  <strong>Consent:</strong>
                  <span style={{ fontWeight: 400 }}>
                    {" "}
                    Means any freely given, specific, informed, unconditional,
                    and unambiguous indication of the Data Principal&apos;s wishes by
                    which they, by a clear affirmative action, signify agreement
                    to the processing of their personal data for the specified
                    purpose.
                  </span>
                  <span style={{ fontWeight: 400 }}>4</span>
                </li>
                <li style={{ fontWeight: 400 }}>
                  <strong>Data Breach:</strong>
                  <span style={{ fontWeight: 400 }}>
                    {" "}
                    Means any unauthorised processing of personal data or
                    accidental disclosure, acquisition, sharing, use,
                    alteration, destruction of or loss of access to personal
                    data, that compromises the confidentiality, integrity or
                    availability of personal data.
                  </span>
                </li>
                <li style={{ fontWeight: 400 }}>
                  <strong>Significant Data Fiduciary (SDF):</strong>
                  <span style={{ fontWeight: 400 }}>
                    {" "}
                    Means any Data Fiduciary or class of Data Fiduciaries as may
                    be notified by the Central Government under Section 10 of
                    the DPDP Act.
                  </span>
                  <span style={{ fontWeight: 400 }}>3</span>
                </li>
              </ul>
              <p>&nbsp;</p>
              <h3>
                <strong>2.0 Personal Data We Collect and Process</strong>
              </h3>
              <p>&nbsp;</p>
              <p>
                <span style={{ fontWeight: 400 }}>
                  We collect and process Personal Data to provide and improve
                  our services. The collection is guided by the principle of
                  data minimisation, meaning we only collect data that is
                  necessary for the specified purpose.
                </span>
                <span style={{ fontWeight: 400 }}>5</span>
                <span style={{ fontWeight: 400 }}>
                  {" "}
                  The types of data we collect are as follows:
                </span>
              </p>
              <p>&nbsp;</p>
              <h4>
                <strong>2.1 Information You Provide to Us</strong>
              </h4>
              <p>&nbsp;</p>
              <p>
                <span style={{ fontWeight: 400 }}>
                  This includes data you voluntarily submit when you interact
                  with our Platform.
                </span>
              </p>
              <ul>
                <li style={{ fontWeight: 400 }}>
                  <strong>For All Users:</strong>
                  <span style={{ fontWeight: 400 }}>
                    {" "}
                    When you create an account, we collect basic registration
                    data, which includes your full name, email address, a mobile
                    phone number for verification, and a password to secure your
                    account.
                  </span>
                </li>
                <li style={{ fontWeight: 400 }}>
                  <strong>For Creators:</strong>
                  <span style={{ fontWeight: 400 }}>
                    {" "}
                    To facilitate your participation and enable commission
                    payouts, we require additional information. This includes a
                    public display name or alias, a biographical description,
                    links to your social media profiles, and crucial financial
                    information such as your bank account number, IFSC code,
                    Unified Payments Interface (UPI) ID, and your Permanent
                    Account Number (PAN) for taxation purposes.
                  </span>
                </li>
                <li style={{ fontWeight: 400 }}>
                  <strong>For Customers:</strong>
                  <span style={{ fontWeight: 400 }}>
                    {" "}
                    When you purchase services from a Creator, we collect
                    transaction data. This includes details of the services you
                    have purchased and the payment method used. To ensure your
                    financial security, we do not store full credit/debit card
                    numbers or other sensitive payment credentials on our
                    servers; this information is handled by our secure
                    third-party payment gateway partners.
                  </span>
                </li>
                <li style={{ fontWeight: 400 }}>
                  <strong>For Brands:</strong>
                  <span style={{ fontWeight: 400 }}>
                    {" "}
                    To enable campaign management and business transactions, we
                    collect business-related information. This includes the
                    registered company name, Goods and Services Tax
                    Identification Number (GSTIN), and contact details of the
                    authorised representative, such as their name, email, and
                    phone number.
                  </span>
                </li>
                <li style={{ fontWeight: 400 }}>
                  <strong>Communications Data:</strong>
                  <span style={{ fontWeight: 400 }}>
                    {" "}
                    We collect information when you communicate with us for user
                    support, provide feedback, or participate in surveys. This
                    may include the content of your messages, emails, and call
                    recordings.
                  </span>
                </li>
              </ul>
              <p>&nbsp;</p>
              <h4>
                <strong>2.2 Information We Collect Automatically</strong>
              </h4>
              <p>&nbsp;</p>
              <p>
                <span style={{ fontWeight: 400 }}>
                  As you navigate and interact with our Platform, we may use
                  automatic data collection technologies to gather certain
                  information about your equipment, browsing actions, and
                  patterns. This includes:
                </span>
              </p>
              <ul>
                <li style={{ fontWeight: 400 }}>
                  <strong>Device and Connection Information:</strong>
                  <span style={{ fontWeight: 400 }}>
                    {" "}
                    We collect information about your computer, mobile device,
                    and internet connection, including your IP address,
                    operating system, browser type, and device identifiers.
                  </span>
                </li>
                <li style={{ fontWeight: 400 }}>
                  <strong>Usage Data:</strong>
                  <span style={{ fontWeight: 400 }}>
                    {" "}
                    We collect details of your visits to our Platform, including
                    traffic data, location data, logs, and other communication
                    data and the resources that you access and use on the
                    Platform. This helps us understand user behaviour and
                    improve service delivery.
                  </span>
                </li>
                <li style={{ fontWeight: 400 }}>
                  <strong>Cookies and Similar Technologies:</strong>
                  <span style={{ fontWeight: 400 }}>
                    {" "}
                    We use cookies and other tracking technologies to recognise
                    you and/or your device(s) and to enhance your user
                    experience.
                  </span>
                </li>
              </ul>
              <p>&nbsp;</p>
              <h4>
                <strong>2.3 Information from Third Parties</strong>
              </h4>
              <p>&nbsp;</p>
              <p>
                <span style={{ fontWeight: 400 }}>
                  We may receive Personal Data about you from other sources. For
                  example, if you choose to link your Mystash account with a
                  third-party service, such as a social media platform for login
                  purposes, we may receive information from that service, such
                  as your name and email address, in accordance with the
                  authorisation procedures determined by such third-party
                  service.
                </span>
              </p>
              <p>&nbsp;</p>
              <h3>
                <strong>3.0 Lawful Basis and Purpose of Processing</strong>
              </h3>
              <p>&nbsp;</p>
              <p>
                <span style={{ fontWeight: 400 }}>
                  Our processing of your Personal Data is always based on a
                  lawful ground and for a specific, explicit, and legitimate
                  purpose.
                </span>
              </p>
              <p>&nbsp;</p>
              <h4>
                <strong>3.1 Our Lawful Basis</strong>
              </h4>
              <p>&nbsp;</p>
              <p>
                <span style={{ fontWeight: 400 }}>
                  The primary legal basis for our processing of your Personal
                  Data is the{" "}
                </span>
                <strong>explicit Consent</strong>
                <span style={{ fontWeight: 400 }}>
                  {" "}
                  you provide to us before we commence processing.
                </span>
                <span style={{ fontWeight: 400 }}>1</span>
                <span style={{ fontWeight: 400 }}>
                  {" "}
                  We ensure that your consent is obtained in a manner that is
                  free, specific, informed, and unambiguous.
                </span>
                <span style={{ fontWeight: 400 }}>4</span>
                <span style={{ fontWeight: 400 }}>
                  {" "}
                  In certain limited circumstances, we may also process your
                  data for &quot;Legitimate Uses&quot; as defined under the DPDP Act, such
                  as when you have voluntarily provided your data for a
                  specified purpose and have not indicated that you do not
                  consent to its use.
                </span>
                <span style={{ fontWeight: 400 }}>7</span>
              </p>
              <p>&nbsp;</p>
              <h4>
                <strong>3.2 Purpose of Processing (Purpose Limitation)</strong>
              </h4>
              <p>&nbsp;</p>
              <p>
                <span style={{ fontWeight: 400 }}>
                  We adhere strictly to the principle of &quot;purpose limitation,&quot;
                  which means we process your Personal Data only for the
                  purposes for which it was collected and for which you have
                  given your consent.
                </span>
                <span style={{ fontWeight: 400 }}>5</span>
                <span style={{ fontWeight: 400 }}>
                  {" "}
                  These purposes include:
                </span>
              </p>
              <ul>
                <li style={{ fontWeight: 400 }}>
                  <strong>Service Provision:</strong>
                  <span style={{ fontWeight: 400 }}>
                    {" "}
                    To provide, operate, maintain, and improve the
                    functionalities of the Mystash Platform.
                  </span>
                </li>
                <li style={{ fontWeight: 400 }}>
                  <strong>Transaction Facilitation:</strong>
                  <span style={{ fontWeight: 400 }}>
                    {" "}
                    To enable and process transactions between Creators,
                    Customers, and Brands, and to facilitate communications
                    necessary for the fulfillment of services.
                  </span>
                </li>
                <li style={{ fontWeight: 400 }}>
                  <strong>Payment Processing:</strong>
                  <span style={{ fontWeight: 400 }}>
                    {" "}
                    To process commission payments to Creators and other
                    financial transactions on the Platform. This includes using
                    your PAN for the deduction of Tax Deducted at Source (TDS)
                    as required by Indian law.
                  </span>
                </li>
                <li style={{ fontWeight: 400 }}>
                  <strong>Legal and Regulatory Compliance:</strong>
                  <span style={{ fontWeight: 400 }}>
                    {" "}
                    To comply with our legal obligations under applicable laws,
                    including the Information Technology Act, 2000, the DPDP
                    Act, 2023, and tax laws.
                  </span>
                </li>
                <li style={{ fontWeight: 400 }}>
                  <strong>Customer Support:</strong>
                  <span style={{ fontWeight: 400 }}>
                    {" "}
                    To respond to your inquiries, provide support, and resolve
                    any issues you may face while using the Platform.
                  </span>
                </li>
                <li style={{ fontWeight: 400 }}>
                  <strong>Platform Improvement:</strong>
                  <span style={{ fontWeight: 400 }}>
                    {" "}
                    To analyse usage patterns, conduct research, and use the
                    insights to enhance the user experience, security, and
                    features of our Platform.
                  </span>
                </li>
                <li style={{ fontWeight: 400 }}>
                  <strong>Marketing and Communications:</strong>
                  <span style={{ fontWeight: 400 }}>
                    {" "}
                    To send you updates, promotional materials, and other
                    information related to our services. We will always provide
                    you with a clear and simple way to opt-out of receiving such
                    communications.
                  </span>
                </li>
              </ul>
              <p>
                <span style={{ fontWeight: 400 }}>
                  As our Platform grows, the volume and nature of the data we
                  process may lead to our classification as a &quot;Significant Data
                  Fiduciary&quot; under the DPDP Act, 2023.
                </span>
                <span style={{ fontWeight: 400 }}>8</span>
                <span style={{ fontWeight: 400 }}>
                  {" "}
                  This designation is based on factors including the volume and
                  sensitivity of personal data processed and the potential risk
                  to Data Principals. Should Mystash be notified as an SDF, we
                  are committed to undertaking the additional compliance
                  measures mandated by law. These measures include, but are not
                  limited to, the appointment of a Data Protection Officer (DPO)
                  based in India, conducting periodic Data Protection Impact
                  Assessments (DPIAs), and undergoing independent data audits.
                </span>
                <span style={{ fontWeight: 400 }}>10</span>
                <span style={{ fontWeight: 400 }}>
                  {" "}
                  In such an event, this Privacy Policy will be updated to
                  reflect these enhanced obligations and provide you with the
                  necessary information regarding our DPO and other compliance
                  mechanisms.
                </span>
              </p>
              <p>&nbsp;</p>
              <h3>
                <strong>4.0 Consent</strong>
              </h3>
              <p>&nbsp;</p>
              <p>
                <span style={{ fontWeight: 400 }}>
                  Your consent is the cornerstone of our data processing
                  activities. We are committed to ensuring that your consent is
                  obtained and managed in a transparent and lawful manner.
                </span>
              </p>
              <p>&nbsp;</p>
              <h4>
                <strong>4.1 Obtaining Consent</strong>
              </h4>
              <p>&nbsp;</p>
              <p>
                <span style={{ fontWeight: 400 }}>
                  We will obtain your consent through a clear affirmative action
                  before or at the time of collecting your Personal Data.
                </span>
                <span style={{ fontWeight: 400 }}>4</span>
                <span style={{ fontWeight: 400 }}>
                  {" "}
                  This means you will be required to take a deliberate step,
                  such as ticking a checkbox, to signify your agreement. Consent
                  requests will be presented in a clear, plain language, and we
                  will not bundle requests for consent for different purposes.
                  Each purpose of processing will require a separate, specific
                  consent from you.
                </span>
                <span style={{ fontWeight: 400 }}>7</span>
              </p>
              <p>&nbsp;</p>
              <h4>
                <strong>4.2 The Notice</strong>
              </h4>
              <p>&nbsp;</p>
              <p>
                <span style={{ fontWeight: 400 }}>
                  Every request for consent will be preceded by or accompanied
                  by a clear notice. This notice is designed to ensure your
                  consent is fully informed. As mandated by the DPDP Act, the
                  notice will provide you with the following information{" "}
                </span>
                <span style={{ fontWeight: 400 }}>6</span>
                <span style={{ fontWeight: 400 }}>:</span>
              </p>
              <ul>
                <li style={{ fontWeight: 400 }}>
                  <span style={{ fontWeight: 400 }}>
                    An itemised description of the Personal Data we seek to
                    collect.
                  </span>
                </li>
                <li style={{ fontWeight: 400 }}>
                  <span style={{ fontWeight: 400 }}>
                    The specific purpose(s) for which the data will be
                    processed.
                  </span>
                </li>
                <li style={{ fontWeight: 400 }}>
                  <span style={{ fontWeight: 400 }}>
                    A clear explanation of how you can exercise your rights as a
                    Data Principal.
                  </span>
                </li>
                <li style={{ fontWeight: 400 }}>
                  <span style={{ fontWeight: 400 }}>
                    The procedure for withdrawing your consent.
                  </span>
                </li>
                <li style={{ fontWeight: 400 }}>
                  <span style={{ fontWeight: 400 }}>
                    The contact details of our Grievance Officer and the
                    procedure for making a complaint to the Data Protection
                    Board of India.
                  </span>
                </li>
              </ul>
              <p>&nbsp;</p>
              <h4>
                <strong>4.3 Withdrawal of Consent</strong>
              </h4>
              <p>&nbsp;</p>
              <p>
                <span style={{ fontWeight: 400 }}>
                  You have the right to withdraw your consent at any time with
                  ease.
                </span>
                <span style={{ fontWeight: 400 }}>1</span>
                <span style={{ fontWeight: 400 }}>
                  {" "}
                  The process for withdrawal will be as straightforward as the
                  process for giving consent. You can withdraw your consent by
                  contacting us through the channels specified in this Policy.
                  Upon withdrawal of your consent, we will cease processing your
                  Personal Data for the purpose(s) for which consent was
                  withdrawn. Please note that the withdrawal of consent will not
                  affect the lawfulness of any processing that occurred before
                  the withdrawal. Furthermore, the consequence of withdrawal may
                  be that we are unable to provide certain services to you, such
                  as processing commission payments if you withdraw consent for
                  processing your financial data.
                </span>
              </p>
              <p>&nbsp;</p>
              <h3>
                <strong>5.0 Your Rights as a Data Principal</strong>
              </h3>
              <p>&nbsp;</p>
              <p>
                <span style={{ fontWeight: 400 }}>
                  Under the DPDP Act, 2023, you are granted several rights to
                  protect and control your Personal Data. We are committed to
                  upholding these rights and have established processes to
                  facilitate their exercise.
                </span>
              </p>
              <p>&nbsp;</p>
              <h4>
                <strong>5.1 Exercising Your Rights</strong>
              </h4>
              <p>&nbsp;</p>
              <p>
                <span style={{ fontWeight: 400 }}>
                  To exercise any of your rights as a Data Principal, please
                  submit a formal request via email to privacy@mystash.co.in.
                  Please include a clear description of your request in the
                  subject line (e.g., &quot;Data Access Request&quot;) to ensure timely
                  processing. We will respond to your request within a
                  reasonable timeframe and in accordance with the timelines
                  prescribed by law.
                </span>
              </p>
              <p>
                <span style={{ fontWeight: 400 }}>
                  The following table provides a summary of your key rights and
                  how to exercise them:
                </span>
              </p>
              <p>&nbsp;</p>
              <h4>
                <strong>
                  Valuable Table: Your Data Protection Rights at a Glance
                </strong>
              </h4>
              <p>
                <br />
                <br />
              </p>
              <table>
                <tbody>
                  <tr>
                    <td>
                      <p>
                        <span style={{ fontWeight: 400 }}>Right</span>
                      </p>
                    </td>
                    <td>
                      <p>
                        <span style={{ fontWeight: 400 }}>What it Means</span>
                      </p>
                    </td>
                    <td>
                      <p>
                        <span style={{ fontWeight: 400 }}>
                          How to Exercise It
                        </span>
                      </p>
                    </td>
                  </tr>
                  <tr>
                    <td>
                      <p>
                        <strong>Right to Access</strong>
                      </p>
                    </td>
                    <td>
                      <p>
                        <span style={{ fontWeight: 400 }}>
                          You can request a summary of your personal data that
                          we process and the identities of third parties we have
                          shared it with.
                        </span>
                        <span style={{ fontWeight: 400 }}>5</span>
                      </p>
                    </td>
                    <td>
                      <p>
                        <span style={{ fontWeight: 400 }}>
                          Email your request to privacy@mystash.co.in with the
                          subject &quot;Data Access Request&quot;.
                        </span>
                      </p>
                    </td>
                  </tr>
                  <tr>
                    <td>
                      <p>
                        <strong>Right to Correction</strong>
                      </p>
                    </td>
                    <td>
                      <p>
                        <span style={{ fontWeight: 400 }}>
                          You can ask us to correct any inaccurate or incomplete
                          personal data we hold about you.
                        </span>
                        <span style={{ fontWeight: 400 }}>7</span>
                      </p>
                    </td>
                    <td>
                      <p>
                        <span style={{ fontWeight: 400 }}>
                          You can update most information directly in your
                          profile settings or email privacy@mystash.co.in for
                          assistance.
                        </span>
                      </p>
                    </td>
                  </tr>
                  <tr>
                    <td>
                      <p>
                        <strong>Right to Erasure</strong>
                      </p>
                    </td>
                    <td>
                      <p>
                        <span style={{ fontWeight: 400 }}>
                          You can request the deletion of your personal data
                          once the purpose for which it was collected is no
                          longer being served.
                        </span>
                        <span style={{ fontWeight: 400 }}>1</span>
                      </p>
                    </td>
                    <td>
                      <p>
                        <span style={{ fontWeight: 400 }}>
                          Email your request to privacy@mystash.co.in with the
                          subject &quot;Data Erasure Request&quot;. Note that we may need
                          to retain certain data for legal and compliance
                          reasons.
                        </span>
                      </p>
                    </td>
                  </tr>
                  <tr>
                    <td>
                      <p>
                        <strong>Right to Grievance Redressal</strong>
                      </p>
                    </td>
                    <td>
                      <p>
                        <span style={{ fontWeight: 400 }}>
                          You have the right to have your complaints regarding
                          data processing addressed in a timely manner.
                        </span>
                        <span style={{ fontWeight: 400 }}>5</span>
                      </p>
                    </td>
                    <td>
                      <p>
                        <span style={{ fontWeight: 400 }}>
                          Please contact our Grievance Officer, Rishabh Thakur,
                          at the details provided in Section 9.0 of this policy.
                        </span>
                      </p>
                    </td>
                  </tr>
                  <tr>
                    <td>
                      <p>
                        <strong>Right to Nominate</strong>
                      </p>
                    </td>
                    <td>
                      <p>
                        <span style={{ fontWeight: 400 }}>
                          You can nominate another individual to exercise your
                          rights on your behalf in the event of your death or
                          incapacity.
                        </span>
                        <span style={{ fontWeight: 400 }}>1</span>
                      </p>
                    </td>
                    <td>
                      <p>
                        <span style={{ fontWeight: 400 }}>
                          Email your nomination details to privacy@mystash.co.in
                          with the subject &quot;Nomination Request&quot;.
                        </span>
                      </p>
                    </td>
                  </tr>
                </tbody>
              </table>
              <p>&nbsp;</p>
              <h3>
                <strong>6.0 Data Sharing and Disclosure</strong>
              </h3>
              <p>&nbsp;</p>
              <p>
                <span style={{ fontWeight: 400 }}>
                  We do not sell your Personal Data. We may, however, share your
                  Personal Data with third parties in the following
                  circumstances, ensuring that such sharing is necessary and
                  lawful:
                </span>
              </p>
              <ul>
                <li style={{ fontWeight: 400 }}>
                  <strong>With Service Providers (Data Processors):</strong>
                  <span style={{ fontWeight: 400 }}>
                    {" "}
                    We engage third-party companies and individuals to perform
                    services on our behalf, such as payment processing, cloud
                    hosting, data analytics, and customer support. We share your
                    Personal Data with these Data Processors only to the extent
                    necessary for them to perform these services. We have
                    contractual agreements in place that obligate them to
                    protect your data and process it only for the purposes we
                    specify.
                  </span>
                </li>
                <li style={{ fontWeight: 400 }}>
                  <strong>Between Users:</strong>
                  <span style={{ fontWeight: 400 }}>
                    {" "}
                    To facilitate the core function of the Platform, we share
                    necessary information between users. For example, a
                    Creator&apos;s public profile information will be visible to
                    Customers and Brands, and a Brand&apos;s campaign details may be
                    shared with Creators they wish to engage.
                  </span>
                </li>
                <li style={{ fontWeight: 400 }}>
                  <strong>For Legal and Compliance Reasons:</strong>
                  <span style={{ fontWeight: 400 }}>
                    {" "}
                    We may disclose your Personal Data if required to do so by
                    law or in the good faith belief that such action is
                    necessary to: (a) comply with a legal obligation or a lawful
                    request from government agencies or law enforcement{" "}
                  </span>
                  <span style={{ fontWeight: 400 }}>13</span>
                  <span style={{ fontWeight: 400 }}>
                    ; (b) protect and defend the rights or property of Mystash;
                    (c) prevent or investigate possible wrongdoing in connection
                    with the Service; or (d) protect the personal safety of
                    users of the Service or the public.
                  </span>
                </li>
                <li style={{ fontWeight: 400 }}>
                  <strong>In Connection with Business Transfers:</strong>
                  <span style={{ fontWeight: 400 }}>
                    {" "}
                    If Mystash is involved in a merger, acquisition, or asset
                    sale, your Personal Data may be transferred. We will provide
                    notice before your Personal Data is transferred and becomes
                    subject to a different Privacy Policy.
                  </span>
                </li>
              </ul>
              <p>&nbsp;</p>
              <h3>
                <strong>7.0 Data Security and Retention</strong>
              </h3>
              <p>&nbsp;</p>
              <p>
                <span style={{ fontWeight: 400 }}>
                  We are committed to protecting your Personal Data and have
                  implemented robust measures to ensure its security and
                  appropriate retention.
                </span>
              </p>
              <p>&nbsp;</p>
              <h4>
                <strong>7.1 Security Safeguards</strong>
              </h4>
              <p>&nbsp;</p>
              <p>
                <span style={{ fontWeight: 400 }}>
                  We implement reasonable security safeguards to protect your
                  Personal Data against unauthorised access, alteration,
                  disclosure, or destruction.
                </span>
                <span style={{ fontWeight: 400 }}>5</span>
                <span style={{ fontWeight: 400 }}>
                  {" "}
                  These measures include technical and organisational controls
                  such as:
                </span>
              </p>
              <ul>
                <li style={{ fontWeight: 400 }}>
                  <strong>Encryption:</strong>
                  <span style={{ fontWeight: 400 }}>
                    {" "}
                    Encrypting data both in transit and at rest.
                  </span>
                </li>
                <li style={{ fontWeight: 400 }}>
                  <strong>Access Controls:</strong>
                  <span style={{ fontWeight: 400 }}>
                    {" "}
                    Implementing strict access control mechanisms to ensure that
                    only authorised personnel have access to Personal Data on a
                    need-to-know basis.
                  </span>
                </li>
                <li style={{ fontWeight: 400 }}>
                  <strong>Regular Reviews:</strong>
                  <span style={{ fontWeight: 400 }}>
                    {" "}
                    Conducting periodic reviews of our information collection,
                    storage, and processing practices, including physical
                    security measures, to guard against unauthorised access to
                    systems.
                  </span>
                  <span style={{ fontWeight: 400 }}>12</span>
                </li>
              </ul>
              <p>&nbsp;</p>
              <h4>
                <strong>7.2 Data Breach Notification</strong>
              </h4>
              <p>&nbsp;</p>
              <p>
                <span style={{ fontWeight: 400 }}>
                  In the unfortunate event of a Personal Data breach, we have a
                  clear response plan. In compliance with the DPDP Act, we will
                  notify the Data Protection Board of India and the affected
                  Data Principals of the breach in the manner and within the
                  timelines prescribed by law.
                </span>
                <span style={{ fontWeight: 400 }}>5</span>
                <span style={{ fontWeight: 400 }}>
                  {" "}
                  The notification will describe the nature of the breach, the
                  likely consequences, and the measures we have taken to
                  mitigate its effects.
                </span>
              </p>
              <p>&nbsp;</p>
              <h4>
                <strong>7.3 Data Retention</strong>
              </h4>
              <p>&nbsp;</p>
              <p>
                <span style={{ fontWeight: 400 }}>
                  We adhere to the principle of &quot;storage limitation&quot;.
                </span>
                <span style={{ fontWeight: 400 }}>5</span>
                <span style={{ fontWeight: 400 }}>
                  {" "}
                  We will retain your Personal Data only for as long as is
                  necessary to fulfill the purposes for which it was collected,
                  as outlined in this Policy.
                </span>
                <span style={{ fontWeight: 400 }}>1</span>
                <span style={{ fontWeight: 400 }}>
                  {" "}
                  We will erase your Personal Data when:
                </span>
              </p>
              <ul>
                <li style={{ fontWeight: 400 }}>
                  <span style={{ fontWeight: 400 }}>
                    The purpose for which it was processed is no longer being
                    served.
                  </span>
                </li>
                <li style={{ fontWeight: 400 }}>
                  <span style={{ fontWeight: 400 }}>
                    You withdraw your consent and there is no other lawful basis
                    for its retention.
                  </span>
                </li>
                <li style={{ fontWeight: 400 }}>
                  <span style={{ fontWeight: 400 }}>
                    The retention is no longer necessary for legal or business
                    purposes.
                  </span>
                </li>
              </ul>
              <p>
                <span style={{ fontWeight: 400 }}>
                  Please note that we may be required to retain certain
                  information for longer periods to comply with legal
                  obligations (such as tax laws requiring the retention of
                  financial records for a specified number of years), resolve
                  disputes, and enforce our agreements.
                </span>
              </p>
              <p>&nbsp;</p>
              <h3>
                <strong>8.0 International Data Transfers</strong>
              </h3>
              <p>&nbsp;</p>
              <p>
                <span style={{ fontWeight: 400 }}>
                  We primarily store and process your Personal Data on servers
                  located within the territory of India.
                </span>
                <span style={{ fontWeight: 400 }}>1</span>
                <span style={{ fontWeight: 400 }}>
                  {" "}
                  However, in certain circumstances, we may need to transfer
                  your Personal Data to other countries. Such transfers will
                  only occur to countries or territories that the Central
                  Government of India has, by notification, deemed to have a
                  robust and reliable data protection regime.
                </span>
                <span style={{ fontWeight: 400 }}>1</span>
                <span style={{ fontWeight: 400 }}>
                  {" "}
                  We will ensure that any such international transfer of your
                  Personal Data is carried out in accordance with applicable
                  Indian laws and that appropriate safeguards are in place to
                  protect your data.
                </span>
              </p>
              <p>&nbsp;</p>
              <h3>
                <strong>9.0 Grievance Redressal</strong>
              </h3>
              <p>&nbsp;</p>
              <p>
                <span style={{ fontWeight: 400 }}>
                  If you have any concerns, questions, or complaints regarding
                  the processing of your Personal Data or a potential breach of
                  your privacy, we encourage you to first contact our Grievance
                  Officer.
                </span>
              </p>
              <p>
                <span style={{ fontWeight: 400 }}>
                  In accordance with the Information Technology Act, 2000 and
                  the Information Technology (Intermediary Guidelines and
                  Digital Media Ethics Code) Rules, 2021, we have appointed a
                  Grievance Officer.
                </span>
                <span style={{ fontWeight: 400 }}>13</span>
              </p>
              <p>
                <span style={{ fontWeight: 400 }}>
                  You can contact our Grievance Officer at:
                </span>
              </p>
              <p>
                <span style={{ fontWeight: 400 }}>
                  <strong>Name:</strong> Rishabh Thakur
                </span>
              </p>
              <p>
                <span style={{ fontWeight: 400 }}>
                  <strong>Email:</strong> rishabh@mystash.co.in
                </span>
              </p>
              <p>
                <span style={{ fontWeight: 400 }}>
                  The Grievance Officer will address your concern and endeavour
                  to resolve it within a reasonable timeframe, not exceeding one
                  (1) month from the date of receipt of the complaint.
                </span>
                <span style={{ fontWeight: 400 }}>13</span>
              </p>
              <p>
                <span style={{ fontWeight: 400 }}>
                  If you are not satisfied with the resolution provided by our
                  Grievance Officer, you have the right to lodge a complaint
                  with the Data Protection Board of India, once it is
                  established and operational under the DPDP Act, 2023.
                </span>
                <span style={{ fontWeight: 400 }}>1</span>
              </p>
              <p>&nbsp;</p>
              <h3>
                <strong>10.0 Children&apos;s Privacy</strong>
              </h3>
              <p>&nbsp;</p>
              <p>
                <span style={{ fontWeight: 400 }}>
                  Our Platform is not intended for use by individuals under the
                  age of 18 (&quot;Child&quot; or &quot;Children&quot;). We do not knowingly collect
                  Personal Data from Children. If you are a parent or guardian
                  and you are aware that your Child has provided us with
                  Personal Data, please contact us. If we become aware that we
                  have collected Personal Data from a Child without verification
                  of parental consent, we will take steps to remove that
                  information from our servers in accordance with the law.
                </span>
                <span style={{ fontWeight: 400 }}>1</span>
              </p>
              <p>&nbsp;</p>
              <h3>
                <strong>11.0 Changes to This Privacy Policy</strong>
              </h3>
              <p>&nbsp;</p>
              <p>
                <span style={{ fontWeight: 400 }}>
                  We may update our Privacy Policy from time to time. We will
                  notify you of any changes by posting the new Privacy Policy on
                  this page and updating the &quot;Last updated&quot; date at the top.
                  We will also endeavour to provide you with a notice, such as
                  adding a statement to our website&apos;s homepage or sending you an
                  email notification, for material changes.
                </span>
              </p>
              <p>
                <span style={{ fontWeight: 400 }}>
                  You are advised to review this Privacy Policy periodically for
                  any changes. Changes to this Privacy Policy are effective when
                  they are posted on this page.
                </span>
              </p>
              <p>&nbsp;</p>
              <h3>
                <strong>12.0 Contact Us</strong>
              </h3>
              <p>&nbsp;</p>
              <p>
                <span style={{ fontWeight: 400 }}>
                  If you have any questions about this Privacy Policy, the
                  practices of this site, or your dealings with this site,
                  please contact us at:
                </span>
              </p>
              <p>
                <span style={{ fontWeight: 400 }}>
                  <strong>Mystash Pvt Ltd</strong>
                </span>
              </p>
              <p>
                <span style={{ fontWeight: 400 }}>
                  B308, JP Nagar, Bangalore, Karnataka, India
                </span>
              </p>
              <p>
                <span style={{ fontWeight: 400 }}>
                  <strong>Email:</strong> privacy@mystash.co.in
                </span>
              </p>
              <p>&nbsp;</p>
              <p>
                <span style={{ fontWeight: 400 }}>
                  <strong>Footnotes:</strong>
                </span>
              </p>
              <ol>
                <li style={{ fontWeight: 400 }}>
                  <span style={{ fontWeight: 400 }}>
                    Digital Personal Data Protection Act, 2023, Section 3.
                  </span>
                </li>
                <li style={{ fontWeight: 400 }}>
                  <span style={{ fontWeight: 400 }}>
                    Digital Personal Data Protection Act, 2023, Section 4.
                  </span>
                </li>
                <li style={{ fontWeight: 400 }}>
                  <span style={{ fontWeight: 400 }}>
                    Digital Personal Data Protection Act, 2023, Section 2.
                  </span>
                </li>
                <li style={{ fontWeight: 400 }}>
                  <span style={{ fontWeight: 400 }}>
                    Digital Personal Data Protection Act, 2023, Section 6.
                  </span>
                </li>
                <li style={{ fontWeight: 400 }}>
                  <span style={{ fontWeight: 400 }}>
                    Digital Personal Data Protection Act, 2023, Section 8.
                  </span>
                </li>
                <li style={{ fontWeight: 400 }}>
                  <span style={{ fontWeight: 400 }}>
                    Digital Personal Data Protection Act, 2023, Section 5.
                  </span>
                </li>
                <li style={{ fontWeight: 400 }}>
                  <span style={{ fontWeight: 400 }}>
                    Digital Personal Data Protection Act, 2023, Section 7.
                  </span>
                </li>
                <li style={{ fontWeight: 400 }}>
                  <span style={{ fontWeight: 400 }}>
                    Digital Personal Data Protection Act, 2023, Section 10.
                  </span>
                </li>
                <li style={{ fontWeight: 400 }}>
                  <span style={{ fontWeight: 400 }}>
                    Digital Personal Data Protection Act, 2023, Section 10(2).
                  </span>
                </li>
                <li style={{ fontWeight: 400 }}>
                  <span style={{ fontWeight: 400 }}>
                    Digital Personal Data Protection Act, 2023, Section 10(2).
                  </span>
                </li>
                <li style={{ fontWeight: 400 }}>
                  <span style={{ fontWeight: 400 }}>
                    Information Technology Act, 2000, Section 43A.
                  </span>
                </li>
                <li style={{ fontWeight: 400 }}>
                  <span style={{ fontWeight: 400 }}>
                    Information Technology (Reasonable Security Practices and
                    Procedures and Sensitive Personal Data or Information)
                    Rules, 2011.
                  </span>
                </li>
                <li style={{ fontWeight: 400 }}>
                  <span style={{ fontWeight: 400 }}>
                    Information Technology (Intermediary Guidelines and Digital
                    Media Ethics Code) Rules, 2021.
                  </span>
                </li>
              </ol>
            </>
          </div>
        </div>
      </main>
    </div>
  );
}